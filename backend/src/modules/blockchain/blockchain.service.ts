import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { CreateAuctionDto } from './dto/create-auction.dto';
@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private adminWallet: ethers.Wallet | null = null;
  private factory: ethers.Contract | null = null;
  private readonly logger = new Logger(BlockchainService.name);

  private factoryAddress =
    process.env.FACTORY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  private factoryABI = [
  'function createAction(uint _biddingTime, address _seller, uint _startingPrice) payable',
  'function getAllActions() public view returns (address[] memory)',
  'event ActionCreated(address indexed seller, address actionAddress, uint startingPrice, uint sellerDeposit, uint endTime)',
  ];

  private auctionABI = [
    'function buyerPaid() view returns (bool)',
    'function sellerShipped() view returns (bool)',
    'function buyerConfirmed() view returns (bool)',
    'function buyerPaidAt() view returns (uint256)',
    'function sellerShippedAt() view returns (uint256)',
    'function confirmShipped() external',
    'function confirmReceived() external',
    'function releaseToSeller() external',
    'function penalizeSeller() external',
    'function placeBid(uint256) payable',
    'function payWinningBid() payable',
    'function finalize() external',
    'function penalizeWinner() external',
    'function withdrawDeposit() external',
    'function highestBidder() view returns (address)',
    'function highestBid() view returns (uint256)',
    'function actionEndTime() view returns (uint256)',
    'function ended() view returns (bool)',
    'function seller() view returns (address)',
    'function getAllBids() view returns (address[], uint256[], uint256[])',
  ];

  constructor(private prisma: PrismaService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL || 'http://127.0.0.1:8545',
      { name: 'hardhat', chainId: Number(process.env.CHAIN_ID || 31337) },
    );

    const adminPk = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPk) {
      this.logger.warn('ADMIN_PRIVATE_KEY not set — only read operations will work.');
    } else {
      this.adminWallet = new ethers.Wallet(adminPk, this.provider);
      this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.adminWallet);
    }
  }

  // ============================================================
  // READ (DB + Blockchain)
  // ============================================================

  async getAllAuctions() {
    return this.prisma.auction.findMany({
      include: {
        item: { include: { category: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOnchainAuctionInfo(address: string) {
    const auction = new ethers.Contract(address, this.auctionABI, this.provider);
    const [seller, highestBidder, highestBid, endTime, ended] = await Promise.all([
      auction.seller().catch(() => null),
      auction.highestBidder().catch(() => null),
      auction.highestBid().catch(() => ethers.BigNumber.from(0)),
      auction.actionEndTime().catch(() => ethers.BigNumber.from(0)),
      auction.ended().catch(() => false),
    ]);

    return {
      seller,
      highestBidder,
      highestBid: ethers.utils.formatEther(highestBid),
      endTime: endTime ? new Date(Number(endTime) * 1000).toISOString() : null,
      ended,
    };
  }

  async getAuctionDetail(address: string) {
    const auctionDb = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      include: {
        item: { include: { category: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });
    if (!auctionDb) throw new NotFoundException('Không tìm thấy đấu giá trong database');
    const onchain = await this.getOnchainAuctionInfo(address);
    return { ...auctionDb, onchain };
  }

  // ============================================================
  // ADMIN / SERVER-SIDE ACTIONS
  // ============================================================
  async createAuction(dto: CreateAuctionDto, userId: number) {
    const {
      name, description, imageUrl, startingPrice, reservePrice, estimateMin, estimateMax,
      mainImage, subImages = [], categoryId, duration, contractAddress,
    } = dto;

    // === 1. KIỂM TRA USER + WALLET ===
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, wallet: true },
    });
    if (!seller) throw new NotFoundException('Người dùng không tồn tại');
    if (!seller.wallet) throw new NotFoundException('Ví chưa thiết lập');

    // === 2. KIỂM TRA CONTRACT ĐÃ TỒN TẠI TRÊN CHAIN (chỉ cần code !== 0x) ===
    try {
      const code = await this.provider.getCode(contractAddress);
      if (code === '0x' || code === '0x0') {
        throw new BadRequestException('Hợp đồng chưa được triển khai');
      }
    } catch {
      throw new BadRequestException('Địa chỉ hợp đồng không hợp lệ');
    }

    // === 3. TÍNH THỜI GIAN ===
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    // === 4. TẠO AUCTION + ITEM ===
    return this.prisma.auction.create({
      data: {
        contractAddress,
        startTime,
        endTime,
        status: 'Active',
        seller: { connect: { id: userId } },
        item: {
          create: {
            name: name.trim(),
            description: description?.trim() || null,
            imageUrl: imageUrl || null,
            startingPrice,
            reservePrice: reservePrice ?? null,
            estimateMin: estimateMin ?? null,
            estimateMax: estimateMax ?? null,
            mainImage,
            subImages,
            owner: { connect: { id: userId } },
            status: 'pending',
            ...(categoryId !== undefined && { category: { connect: { id: categoryId } } }),
          },
        },
      },
      include: {
        item: { include: { category: true, owner: { select: { id: true, name: true } } } },
        seller: { select: { id: true, name: true, wallet: true } },
      },
    });
  }

  //Cron job tự động finalize auctions đã kết thúc
  @Cron(CronExpression.EVERY_MINUTE)
  async autoFinalizeAuctions() {
    const now = new Date();
    const auctions = await this.prisma.auction.findMany({
      where: { status: 'Active', endTime: { lte: now } },
    });

    for (const a of auctions) {
      try {
        const contract = new ethers.Contract(a.contractAddress, this.auctionABI, this.adminWallet || this.provider);
        const ended = await contract.ended();
        if (ended) continue;

        const [highestBidder, highestBid] = await Promise.all([
          contract.highestBidder(),
          contract.highestBid(),
        ]);

        if (highestBidder === ethers.constants.AddressZero) {
          await this.prisma.auction.update({
            where: { id: a.id },
            data: { status: 'Ended' },
          });
          continue;
        }

        const tx = await contract.finalize();
        await tx.wait();

        // LẤY USER ID TỪ ĐỊA CHỈ VÍ
        const bidderUser = await this.prisma.user.findUnique({
          where: { wallet: highestBidder},
        });

        if (!bidderUser) {
          this.logger.warn(`Bidder wallet not found: ${highestBidder}`);
          continue;
        }

        // TẠO BẢN GHI WINNER
        await this.prisma.auctionWinner.create({
          data: {
            auction: { connect: { id: a.id } },
            bidder: { connect: { id: bidderUser.id } },
            bidAmount: parseFloat(ethers.utils.formatEther(highestBid)),
          },
        });

        // CẬP NHẬT AUCTION
        await this.prisma.auction.update({
          where: { id: a.id },
          data: { status: 'Ended' },
        });

        this.logger.log(`Auction finalized: ${a.contractAddress} | Winner: ${highestBidder}`);
      } catch (err: any) {
        this.logger.error(`Finalize error: ${err.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoPenalizeWinners() {
    if (!this.adminWallet) return;
    const now = Math.floor(Date.now() / 1000);
    const auctions = await this.prisma.auction.findMany({ where: { status: 'Ended' } });

    for (const a of auctions) {
      try {
        const contract = new ethers.Contract(a.contractAddress, this.auctionABI, this.adminWallet);
        const [ended, isPaid, endTime] = await Promise.all([
          contract.ended().catch(() => true),
          contract.buyerPaid().catch(() => false),
          contract.actionEndTime().catch(() => ethers.BigNumber.from(0)),
        ]);

        if (ended && !isPaid && now > Number(endTime) + 60) {
          const tx = await contract.penalizeWinner();
          await tx.wait();
          await this.prisma.auction.update({
            where: { id: a.id },
            data: { status: 'Penalized' },
          });
          this.logger.warn(`Winner penalized: ${a.contractAddress}`);
        }
      } catch (err: any) {
        this.logger.error(`Penalize error: ${err.message}`);
      }
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async autoPenalizeSeller() {
    if (!this.adminWallet) {
      this.logger.warn('ADMIN_PRIVATE_KEY not set → skip auto penalize seller');
      return;
    }

    this.logger.log('Bắt đầu kiểm tra phạt seller...');

    const now = Math.floor(Date.now() / 1000);
    const auctions = await this.prisma.auction.findMany({
      where: { status: 'Paid' }, // Chỉ lấy những cái đã thanh toán
    });

    for (const auction of auctions) {
      try {
        const contract = new ethers.Contract(auction.contractAddress, this.auctionABI, this.adminWallet);

        // DÙNG CHÍNH XÁC CÁC HÀM TRONG CONTRACT MỚI
        const [buyerPaidAt, sellerShipped] = await Promise.all([
          contract.buyerPaidAt().catch(() => 0),
          contract.sellerShipped().catch(() => false),
        ]);

        // Nếu chưa thanh toán → bỏ qua
        if (!buyerPaidAt || buyerPaidAt === 0) continue;

        // Nếu seller đã giao hàng → bỏ qua
        if (sellerShipped) continue;

        // Nếu quá 14 ngày kể từ khi buyer thanh toán → PHẠT SELLER
        if (now > Number(buyerPaidAt) + 14 * 24 * 60 * 60) {
          const tx = await contract.penalizeSeller({ gasLimit: 300000 });
          await tx.wait();

          await this.prisma.auction.update({
            where: { id: auction.id },
            data: { status: 'PenalizedSeller' },
          });

          this.logger.warn(`PHẠT SELLER THÀNH CÔNG: ${auction.contractAddress} | Tx: ${tx.hash}`);
        }
      } catch (err: any) {
        // BỎ QUA LỖI CONTRACT CŨ HOẶC ĐÃ ĐƯỢC XỬ LÝ
        if (err.code === 'CALL_EXCEPTION' || err.message.includes('reverted')) {
          continue;
        }
        this.logger.error(`Lỗi kiểm tra phạt seller ${auction.contractAddress}: ${err.message}`);
      }
    }

    this.logger.log('Kiểm tra phạt seller hoàn tất.');
  }
  async penalizeWinner(address: string) {
    if (!this.adminWallet) throw new BadRequestException('No admin wallet');
    const contract = new ethers.Contract(address, this.auctionABI, this.adminWallet);
    const tx = await contract.penalizeWinner();
    await tx.wait();
    await this.prisma.auction.update({
      where: { contractAddress: address },
      data: { status: 'Penalized' },
    });
    return { txHash: tx.hash, message: 'Winner penalized successfully' };
  }

  // ============================================================
  // FRONTEND (MetaMask-driven)
  // ============================================================

  /**
   * Helper: tạo transaction record với quan hệ đúng kiểu
   */
    private createTransactionData(
      base: Pick<Prisma.TransactionCreateInput, 'txHash' | 'type'> & {
        amount?: number;
        fromAddress?: string;
        toAddress?: string;
      },
      userId: number,
      auctionId: number,
    ): Prisma.TransactionCreateInput {
      return {
        ...base,
        user: { connect: { id: userId } },
        auction: { connect: { id: auctionId } },
      };
    }

    // LẤY DANH SÁCH ĐẤU GIÁ MÀ USER THẮNG (từ bảng AuctionWinner)
    async getWinningAuctions(userId: number) {
    const winners = await this.prisma.auctionWinner.findMany({
      where: {
        bidderId: userId,
      },
      include: {
        auction: {
          include: {
            item: {
              select: {
                name: true,
                description: true,
                imageUrl: true,
                startingPrice: true,
              },
            },
            seller: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        finalizedAt: 'desc',
      },
    });

    // Format trả về cho FE
    return winners.map((w) => ({
      id: w.auction.id,
      contractAddress: w.auction.contractAddress,
      item: w.auction.item,
      seller: w.auction.seller,
      startTime: w.auction.startTime,
      endTime: w.auction.endTime,
      status: w.auction.status,
      winningBid: w.bidAmount,
      finalizedAt: w.finalizedAt,
      txHash: w.txHash,
    }));
  }
  
  // LẤY DANH SÁCH ĐẤU GIÁ CỦA TÔI
  async getMyAuctions(userId: number) {
    const auctions = await this.prisma.auction.findMany({
      where: { sellerId: userId },
      include: {
        item: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
        seller: { select: { id: true, name: true, wallet: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // LẤY ONCHAIN INFO CHO TỪNG AUCTION
    const result = await Promise.all(
      auctions.map(async (auc) => {
        try {
          const onchain = await this.getOnchainAuctionInfo(auc.contractAddress);
          return { ...auc, onchain };
        } catch {
          return { ...auc, onchain: null };
        }
      }),
    );

    return result;
  }
  async recordBid(userId: number, address: string, amount: number, txHash: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      select: { id: true },
    });
    if (!auction) throw new NotFoundException('Auction not found');

    // LƯU VÀO BẢNG BID (cập nhật nếu trùng)
    const existingBid = await this.prisma.bid.findFirst({
      where: { bidderId: userId, auctionId: auction.id },
    });

    if (existingBid) {
      await this.prisma.bid.update({
        where: { id: existingBid.id },
        data: { amount, txHash },
      });
    } else {
      await this.prisma.bid.create({
        data: {
          amount,
          txHash,
          bidder: { connect: { id: userId } },
          auction: { connect: { id: auction.id } },
        },
      });
    }

    // KHÔNG LƯU VÀO transaction (tránh trùng)
    // → Chỉ lưu bid → transaction table nếu cần audit riêng

    return { message: 'Bid recorded successfully', txHash };
  }

  // Ghi nhận thanh toán người thắng
  async recordPayment(userId: number, address: string, txHash: string) {
    this.logger.log('recordPayment() STARTED', { userId, address, txHash });

    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      include: { winner: { include: { bidder: true } } },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy đấu giá');
    if (!auction.winner) throw new BadRequestException('Chưa có người thắng');
    if (auction.winner.bidderId !== userId) throw new ForbiddenException('Bạn không phải người thắng');

    if (auction.status === 'Paid' || auction.status === 'Completed') {
      return { success: true, message: 'Đã thanh toán rồi!' };
    }

    // KIỂM TRA TRÊN CHAIN: buyerPaid = true?
    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const buyerPaid = await contract.buyerPaid();

    if (!buyerPaid) {
      throw new BadRequestException('Chưa thấy thanh toán trên chain. Vui lòng đợi 10-30s');
    }

    // Cập nhật DB
    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Paid' },
    });

    // Ghi transaction
    await this.prisma.transaction.create({
      data: {
        txHash,
        type: 'payment',
        amount: auction.winner.bidAmount.toNumber() * 0.9,
        user: { connect: { id: userId } },
        auction: { connect: { id: auction.id } },
      },
    });

    this.logger.log(`Thanh toán thành công: ${address}`);
    return { success: true, message: 'Thanh toán đã được ghi nhận!' };
  }

  async confirmReceived(userId: number, address: string, txHash: string) {
    this.logger.log('confirmReceived() STARTED', { userId, address, txHash });

    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      include: { winner: { include: { bidder: true } } },
    });

    if (!auction || !auction.winner || auction.winner.bidderId !== userId) {
      throw new ForbiddenException('Bạn không phải người thắng');
    }

    if (auction.status === 'Completed') {
      return { success: true, message: 'Đã xác nhận rồi!' };
    }

    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const buyerConfirmed = await contract.buyerConfirmed();

    if (!buyerConfirmed) {
      throw new BadRequestException('Chưa xác nhận nhận hàng trên chain');
    }

    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Completed' },
    });

    await this.prisma.transaction.create({
      data: {
        txHash,
        type: 'confirm',
        amount: 0,
        user: { connect: { id: userId } },
        auction: { connect: { id: auction.id } },
      },
    });

    return { success: true, message: 'Xác nhận thành công! Tiền đã chuyển cho seller.' };
  }

  async getAllBids(address: string) {
  try {
    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const [bidders, amounts, deposits] = await contract.getAllBids();

    return bidders
      .map((addr: string, i: number) => ({
        bidder: addr,
        amount: ethers.utils.formatEther(amounts[i]),
        deposit: ethers.utils.formatEther(deposits[i]),
      }))
      .filter(b => 
        b.bidder !== ethers.constants.AddressZero && 
        parseFloat(b.amount) > 0
      );
  } catch (error: any) {
    if (error.code === 'CALL_EXCEPTION') {
      this.logger.warn(`getAllBids() failed for ${address}: ${error.message}`);
      return []; // TRẢ MẢNG RỖNG → FRONTEND HIỆN "Chưa có ai đấu giá"
    }
    throw error; // Các lỗi khác vẫn throw
  }
}

  // ============================================================
  // Transaction verification
  // ============================================================
  async verifyTransaction(txHash: string, expectedToAddress?: string) {
    if (!txHash) return false;
    const tx = await this.provider.getTransaction(txHash);
    if (!tx) return false;
    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt?.blockNumber || receipt.status !== 1) return false;
    if (expectedToAddress && tx.to?.toLowerCase() !== expectedToAddress.toLowerCase()) return false;
    return true;
  }

  // ============================================================
  // Confirm shipped by seller
  // ============================================================
  async confirmShippedBySeller(userId: number, contractAddress: string, txHash: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress },
      include: { seller: true },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy đấu giá');
    if (auction.sellerId !== userId) throw new ForbiddenException('Bạn không phải seller');
    if (auction.status !== 'Paid') throw new BadRequestException('Chưa được thanh toán');

    // Kiểm tra trên chain
    const contract = new ethers.Contract(contractAddress, this.auctionABI, this.provider);
    const shipped = await contract.sellerShipped();
    if (!shipped) throw new BadRequestException('Chưa thấy xác nhận giao hàng trên chain. Đợi 10-30s');

    // CẬP NHẬT TRẠNG THÁI THÀNH "SHIPPED"
    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Shipped' },
    });

    // Ghi log (chống trùng txHash)
    const exist = await this.prisma.transaction.findUnique({ where: { txHash } });
    if (!exist) {
      await this.prisma.transaction.create({
        data: {
          txHash,
          type: 'shipped',
          amount: 0,
          user: { connect: { id: userId } },
          auction: { connect: { id: auction.id } },
        },
      });
    }

    return { success: true, message: 'Đã xác nhận giao hàng! Chờ người mua nhận hàng.' };
  }
}