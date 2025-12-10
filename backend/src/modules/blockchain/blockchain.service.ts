import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    'function autoRefundLosers() external',
  ];

  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {
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
  async createAuctionFromApprovedItem(
    userId: number,
    data: {
      itemId: number
      contractAddress: string
      txHash: string
    }
  ) {
    const { itemId, contractAddress, txHash } = data

    // 1. KIỂM TRA ITEM CÓ TỒN TẠI + ĐÃ ĐƯỢC DUYỆT + CHƯA CÓ AUCTION
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { auction: true, owner: true }
    })

    if (!item) throw new NotFoundException('Item không tồn tại')
    if (item.ownerId !== userId) throw new ForbiddenException('Không phải chủ sở hữu')
    if (item.status !== 'approved') throw new BadRequestException('Item chưa được duyệt')
    if (item.auction) throw new BadRequestException('Item đã được tạo đấu giá rồi')

    // 2. KIỂM TRA CONTRACT THẬT SỰ TỒN TẠI TRÊN CHAIN
    try {
      const code = await this.provider.getCode(contractAddress)
      if (code === '0x' || code === '0x0') {
        throw new BadRequestException('Hợp đồng chưa được triển khai')
      }
    } catch (err) {
      throw new BadRequestException('Địa chỉ hợp đồng không hợp lệ')
    }

    // 3. TẠO AUCTION
    const startTime = new Date();
    this.logger.log(`Duration:  ${item.duration} minutes`);
    const endTime = new Date(startTime.getTime() + (item.duration ?? 0) * 60 * 1000)
    
    const auction = await this.prisma.auction.create({
      data: {
        contractAddress,
        startTime,
        endTime,
        status: 'Active',
        seller: { connect: { id: userId } },
        item: { connect: { id: itemId } },
      },
      include: {
        item: {
          include: {
            category: true,
            owner: { select: { id: true, name: true, wallet: true } }
          }
        },
        seller: { select: { id: true, name: true, wallet: true } }
      }
    })
    await this.prisma.item.update({
      where: { id: itemId },
      data: { status: 'active' } 
    })
    return auction
  }
  
  //Cron job tự động finalize auctions đã kết thúc
  @Cron(CronExpression.EVERY_MINUTE)
  async autoFinalizeAuctions() {
    const now = new Date();

    const auctions = await this.prisma.auction.findMany({
      where: { 
        status: 'Active',
        endTime: { lte: now }   
      },
      include: { item: true, seller: true },
    });

    for (const a of auctions) {
      try {
        const contract = new ethers.Contract(
          a.contractAddress,
          this.auctionABI,
          this.adminWallet || this.provider
        );

        const ended = await contract.ended();
        if (ended) continue;

        const [highestBidder, highestBid] = await Promise.all([
          contract.highestBidder(),
          contract.highestBid(),
        ]);

        // ===================================================
        // 1️⃣ KHÔNG AI THẮNG (highestBidder = address zero)
        // ===================================================
        if (highestBidder === ethers.constants.AddressZero) {
          await this.prisma.auction.update({
            where: { id: a.id },
            data: { status: 'Ended' },
          });

          // 🔥 Emit event không ai thắng
          this.eventEmitter.emit('auction.finished', {
            auctionId: a.id,
            sellerId: a.sellerId,
            title: a.item.name,
            winnerId: null,
            image: a.item.mainImage,
          });

          this.logger.log(`Auction ended with NO WINNER: ${a.contractAddress}`);
          continue;
        }

        // ===================================================
        // 2️⃣ CÓ NGƯỜI THẮNG
        // ===================================================

        // finalize + refund losers
        const tx1 = await contract.finalize();
        await tx1.wait();

        const tx2 = await contract.autoRefundLosers({ gasLimit: 3_000_000 });
        await tx2.wait();

        this.logger.warn(
          `Refund losers success! Contract: ${a.contractAddress} | Tx: ${tx2.hash}`
        );

        // Lấy user từ ví highestBidder
        const bidderUser = await this.prisma.user.findUnique({
          where: {
            wallet: highestBidder,
          },
        });

        if (!bidderUser) {
          this.logger.warn(`Bidder wallet not found in DB: ${highestBidder}`);
          continue;
        }

        // Lưu winner
        await this.prisma.auctionWinner.create({
          data: {
            auctionId: a.id,
            bidderId: bidderUser.id,
            bidAmount: parseFloat(ethers.utils.formatEther(highestBid)),
          },
        });

        // Cập nhật trạng thái auction
        await this.prisma.auction.update({
          where: { id: a.id },
          data: { status: 'Ended' },
        });

        this.logger.log(
          `Auction finalized: ${a.contractAddress} | Winner: ${highestBidder}`
        );

        // 🔥 Emit event CÓ người thắng
        this.eventEmitter.emit('auction.finished', {
          auctionId: a.id,
          sellerId: a.sellerId,
          title: a.item.name,
          winnerId: bidderUser.id,
          image: a.item.mainImage,
        });

      } catch (err: any) {
        this.logger.error(`Finalize error: ${err.message}`);
      }
    }
  }


  @Cron(CronExpression.EVERY_MINUTE)
  async autoPenalizeWinners() {
    if (!this.adminWallet) return;

    const now = Math.floor(Date.now() / 1000);

    const auctionsToCheck = await this.prisma.auction.findMany({
      where: { status: 'Ended' },
      include: {
        item: true,
        winner: { include: { bidder: true } }
      }
    });

    for (const a of auctionsToCheck) {
      try {
        const contract = new ethers.Contract(a.contractAddress, this.auctionABI, this.adminWallet);
        const [ended, isPaid, endTime] = await Promise.all([
          contract.ended().catch(() => true),
          contract.buyerPaid().catch(() => false),
          contract.actionEndTime().catch(() => ethers.BigNumber.from(0)),
        ]);

        const endTimeNum = Number(endTime);
        const timeSinceEnd = now - endTimeNum;

        // NHẮC NHỞ SAU 30 GIÂY KẾT THÚC – NẾU CHƯA THANH TOÁN
        if (ended && !isPaid && timeSinceEnd >= 30 && timeSinceEnd <= 50) {
          if (a.winner?.bidderId) {
            this.eventEmitter.emit('payment.required', {
              userId: a.winner.bidderId,
              auctionId: a.id,
              title: a.item?.name || 'Đấu giá',
              image: a.item?.mainImage ? `/uploads/${a.item.mainImage}` : null,
              link: `/auction/${a.contractAddress}`,
            });

            this.logger.log(`GỬI NHẮC NHỞ THANH TOÁN SAU 30s CHO BUYER: ${a.contractAddress}`);
          }
        }

        // PHẠT SAU 60 GIÂY – NẾU VẪN CHƯA THANH TOÁN
        if (ended && !isPaid && timeSinceEnd > 60) {
          const tx = await contract.penalizeWinner();
          await tx.wait();

          await this.prisma.auction.update({
            where: { id: a.id },
            data: { status: 'Penalized' },
          });

          if (a.winner?.bidderId) {
            this.eventEmitter.emit('auction.penalizedBuyer', {
              buyerId: a.winner.bidderId,
              auctionId: a.id,
              title: a.item?.name || 'Auction',
              image: a.item?.mainImage || null,
            });
          }

          this.logger.warn(`Winner bị phạt sau 60s không thanh toán: ${a.contractAddress}`);
        }
      } catch (err: any) {
        this.logger.error(`Lỗi xử lý auction ${a.contractAddress}: ${err.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoPenalizeSeller() {
    if (!this.adminWallet) {
      this.logger.warn('ADMIN_PRIVATE_KEY not set');
      return;
    }

    this.logger.log('Bắt đầu kiểm tra phạt seller...');

    // CHỈ DÙNG include → KHÔNG DÙNG select → KHÔNG LỖI!
    const paidAuctions = await this.prisma.auction.findMany({
      where: { status: 'Paid' },
      include: {
        item: true,
      }
    });

    let count = 0;

    for (const a of paidAuctions) {
      try {
        const contract = new ethers.Contract(a.contractAddress, this.auctionABI, this.adminWallet);
        const [buyerPaidAt, sellerShipped] = await Promise.all([
          contract.buyerPaidAt(),
          contract.sellerShipped(),
        ]);

        const paidAt = Number(buyerPaidAt);
        const now = Math.floor(Date.now() / 1000);

        if (paidAt === 0 || sellerShipped || now <= paidAt + 60) continue;

        this.logger.warn(`ĐANG PHẠT SELLER: ${a.contractAddress}`);
        const tx = await contract.penalizeSeller({ gasLimit: 500000 });
        await tx.wait();

        await this.prisma.auction.update({
          where: { id: a.id },
          data: { status: 'PenalizedSeller' },
        });

        this.eventEmitter.emit('auction.penalizedSeller', {
          sellerId: a.sellerId,
          auctionId: a.id,
          title: a.item?.name || 'Auction',
          image: a.item?.mainImage || null,
        });

        count++;
        this.logger.warn(`PHẠT SELLER THÀNH CÔNG + ĐÃ GỬI THÔNG BÁO! Tx: ${tx.hash}`);
      } catch (err: any) {
        if (err.reason?.includes('Still in delivery window')) continue;
        this.logger.error(`Lỗi phạt seller ${a.contractAddress}: ${err.reason || err.message}`);
      }
    }

    this.logger.log(`Hoàn tất – Đã phạt ${count} seller + gửi thông báo`);
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
            owner: true,
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
      include: { 
        winner: { include: { bidder: true } },
        item: true,
        seller: { select: { id: true } }
      },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy đấu giá');
    if (!auction.winner) throw new BadRequestException('Chưa có người thắng');
    if (auction.winner.bidderId !== userId) throw new ForbiddenException('Bạn không phải là người thắng');

    if (auction.status === 'Paid' || auction.status === 'Completed') {
      return { success: true, message: 'Đã thanh toán rồi!' };
    }

    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const buyerPaid = await contract.buyerPaid();
    if (!buyerPaid) throw new BadRequestException('Chưa thấy thanh toán trên chain. Vui lòng đợi 10-30s');

    // CẬP NHẬT DB
    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Paid', buyerPaidAt: new Date() },
    });

    await this.prisma.transaction.create({
      data: {
        txHash,
        type: 'payment',
        amount: auction.winner.bidAmount.toNumber() * 0.9,
        user: { connect: { id: userId } },
        auction: { connect: { id: auction.id } },
      },
    });

    // GỬI THÔNG BÁO CHO CẢ BUYER + SELLER
    this.eventEmitter.emit('payment.completed', {
      buyerId: userId,
      sellerId: auction.sellerId,
      auctionId: auction.id,
      title: auction.item?.name || 'Đấu giá',
      image: auction.item?.mainImage ? `/uploads/${auction.item.mainImage}` : null,
    });

    this.logger.log(`Thanh toán thành công + ĐÃ GỬI THÔNG BÁO CHO CẢ 2 BÊN: ${address}`);
    return { success: true, message: 'Thanh toán đã được ghi nhận!' };
  }

  // Seller xác nhận giao hàng
  async confirmShippedBySeller(userId: number, contractAddress: string, txHash: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress },
      include: { 
        seller: true,
        winner: { include: { bidder: true } },
        item: true,
      },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy đấu giá');
    if (auction.sellerId !== userId) throw new ForbiddenException('Bạn không phải seller');
    if (auction.status !== 'Paid') throw new BadRequestException('Chưa được thanh toán');

    const contract = new ethers.Contract(contractAddress, this.auctionABI, this.provider);
    const shipped = await contract.sellerShipped();
    if (!shipped) throw new BadRequestException('Chưa thấy xác nhận giao hàng trên chain. Đợi 10-30s');

    // CẬP NHẬT TRẠNG THÁI
    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Shipped' },
    });

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

    // GỬI THÔNG BÁO CHO BUYER: "HÀNG ĐÃ GIAO"
    this.eventEmitter.emit('auction.shipped', {
      buyerId: auction.winner?.bidderId,
      auctionId: auction.id,
      title: auction.item?.name || 'Đấu giá',
      image: auction.item?.mainImage ? `/uploads/${auction.item.mainImage}` : null,
    });

    this.logger.log(`Seller đã giao hàng + ĐÃ GỬI THÔNG BÁO CHO BUYER: ${contractAddress}`);
    return { success: true, message: 'Đã xác nhận giao hàng! Chờ người mua nhận hàng.' };
  }

  // Buyer xác nhận nhận hàng
  async confirmReceived(userId: number, address: string, txHash: string) {
    this.logger.log('confirmReceived() STARTED', { userId, address, txHash });

    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      include: { 
        winner: { include: { bidder: true } },
        seller: { select: { id: true } },
        item: true,
      },
    });

    if (!auction || !auction.winner || auction.winner.bidderId !== userId) {
      throw new ForbiddenException('Bạn không phải người thắng');
    }

    if (auction.status === 'Completed') {
      return { success: true, message: 'Đã xác nhận rồi!' };
    }

    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const buyerConfirmed = await contract.buyerConfirmed();
    if (!buyerConfirmed) throw new BadRequestException('Chưa xác nhận nhận hàng trên chain');

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

    // GỬI THÔNG BÁO CHO SELLER: "GIAO DỊCH HOÀN TẤT – TIỀN ĐÃ CHUYỂN"
    this.eventEmitter.emit('auction.completed', {
      sellerId: auction.sellerId,
      auctionId: auction.id,
      title: auction.item?.name || 'Đấu giá',
      image: auction.item?.mainImage ? `/uploads/${auction.item.mainImage}` : null,
    });

    this.logger.log(`Buyer đã nhận hàng + ĐÃ GỬI THÔNG BÁO CHO SELLER: ${address}`);
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

  

  // TÍNH TỔNG DOANH THU CỦA MỘT SELLER
  async getSellerRevenue(sellerId: number) {
    const result = await this.prisma.auctionWinner.findMany({
      where: {
        auction: {
          sellerId: sellerId,
          status: 'Completed', // CHỈ LẤY NHỮNG PHIÊN ĐÃ THANH TOÁN
        },
      },
      select: {
        bidAmount: true, // số tiền người thắng đã trả
      },
    })

    // Cộng tổng tất cả bidAmount
    const totalRevenue = result.reduce((sum, winner) => {
      return sum + Number(winner.bidAmount)
    }, 0)

    return {
      sellerId,
      totalAuctionsWon: result.length,
      totalRevenue: totalRevenue.toFixed(4), // trả về dạng string 4 chữ số thập phân
      currency: 'ETH',
    }
  }

  // TOP 10 SELLER DOANH THU CAO NHẤT (nếu muốn hiển thị bảng xếp hạng)
  async getTopSellers(limit = 10) {
    const winners = await this.prisma.auctionWinner.findMany({
      where: {
        auction: {
          status: 'Completed',
        },
      },
      select: {
        bidAmount: true,
        auction: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                wallet: true,
              },
            },
          },
        },
      },
    })

    // Gom nhóm theo seller
    const revenueMap = new Map<number, { seller: any; revenue: number; count: number }>()

    for (const winner of winners) {
      const seller = winner.auction.seller
      const current = revenueMap.get(seller.id) || { seller, revenue: 0, count: 0 }
      current.revenue += Number(winner.bidAmount)
      current.count += 1
      revenueMap.set(seller.id, current)
    }

    // Chuyển sang mảng + sort
    const topSellers = Array.from(revenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return topSellers.map(item => ({
      sellerId: item.seller.id,
      name: item.seller.name,
      wallet: item.seller.wallet,
      totalRevenue: item.revenue.toFixed(4),
      auctionsSold: item.count,
    }))
  }
}