import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private adminWallet: ethers.Wallet | null = null;
  private factory: ethers.Contract | null = null;
  private readonly logger = new Logger(BlockchainService.name);

  private factoryAddress =
    process.env.FACTORY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  private factoryABI = [
    'function createAction(uint _biddingTime, address _seller) public',
    'function getAllActions() public view returns (address[] memory)',
    'event ActionCreated(address indexed seller, address actionAddress, uint endTime)',
  ];

  private auctionABI = [
    'function placeBid(uint _amount) payable',
    'function payWinningBid() payable',
    'function bids(address) view returns (uint amount, uint deposit, bool refunded)',
    'function confirmReceived() external',
    'function finalize() external',
    'function openDispute() external',
    'function refundBuyer() external',
    'function penalizeWinner() external',
    'function withdrawDeposit() external',
    'function getAllBids() view returns (address[] memory, uint[] memory, uint[] memory)',
    'function seller() view returns (address)',
    'function highestBidder() view returns (address)',
    'function highestBid() view returns (uint)',
    'function actionEndTime() view returns (uint)',
    'function ended() view returns (bool)',
    'function isPaidToSeller() view returns (bool)',
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

  async createAuction(data: any, userId: number) {
    // Lấy thông tin seller
    const seller = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!seller?.wallet) throw new NotFoundException('User wallet not found');

    // Kiểm tra contract có tồn tại không
    try {
      const code = await this.provider.getCode(data.contractAddress);
      if (code === '0x') throw new Error('Contract not deployed');
    } catch {
      throw new BadRequestException('Invalid contract address');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.duration * 1000); // duration từ frontend

    return this.prisma.auction.create({
      data: {
        item: {
          create: {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            startingPrice: data.startingPrice,
            reservePrice: data.reservePrice,
            ownerId: userId,
            status: 'pending',
            categoryId: data.categoryId, // thêm category
          },
        },
        seller: { connect: { id: userId } },
        contractAddress: data.contractAddress,
        startTime,
        endTime,
        status: 'Active',
      },
      include: { item: true, seller: true },
    });
  }


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
          contract.isPaidToSeller().catch(() => false),
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
    console.log('recordPayment() STARTED', { userId, address, txHash });

    try {
      // 1. LẤY AUCTION + AuctionWinner (có bidAmount)
      const auction = await this.prisma.auction.findUnique({
        where: { contractAddress: address },
        select: {
          id: true,
          status: true,
          winner: {
            select: {
              bidderId: true,
              bidAmount: true,          // ← LẤY GIÁ THẮNG TỪ ĐÂY
              bidder: {
                select: { id: true, wallet: true },
              },
            },
          },
        },
      });

      if (!auction) throw new NotFoundException('Auction not found');
      if (!auction.winner) throw new BadRequestException('Chưa có người thắng');
      if (auction.winner.bidderId !== userId) throw new ForbiddenException('Bạn không phải người thắng');

      const bidderWallet = auction.winner.bidder.wallet;
      if (!bidderWallet) throw new BadRequestException('Chưa liên kết ví');

      const winningBid = Number(auction.winner.bidAmount);
      if (isNaN(winningBid) || winningBid <= 0) {
        throw new BadRequestException('Giá thắng không hợp lệ');
      }

      // 2. KIỂM TRA txHash ĐÃ TỒN TẠI
      const existingTx = await this.prisma.transaction.findUnique({ where: { txHash } });
      if (existingTx) {
        console.log('Transaction already recorded:', existingTx.id);
        return { success: true, message: 'Đã ghi nhận', transaction: existingTx };
      }

      // 3. KIỂM TRA GIAO DỊCH TRÊN CHAIN
      const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        const blockNumber = await provider.getBlockNumber();
        throw new BadRequestException(`Giao dịch chưa confirm. Block hiện tại: ${blockNumber}`);
      }
      if (!receipt.status) {
        throw new BadRequestException('Giao dịch thất bại trên chain');
      }
      console.log('Receipt confirmed:', receipt.blockNumber);

      // 4. KIỂM TRA isPaidToSeller
      const contract = new ethers.Contract(address, this.auctionABI, provider);
      const isPaid = await contract.isPaidToSeller();
      console.log('isPaidToSeller:', isPaid);
      if (!isPaid) {
        throw new BadRequestException('Chưa thanh toán trên chain');
      }

      // 5. TÍNH TOÁN 90%
      const amount = winningBid * 0.9;

      // 6. GHI NHẬN DB
      const transaction = await this.prisma.transaction.create({
        data: this.createTransactionData(
          { txHash, type: 'payment', amount, toAddress: address },
          userId,
          auction.id,
        ),
      });
      console.log('Transaction saved:', transaction.id);

      // 7. CẬP NHẬT TRẠNG THÁI
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: 'Paid' },
      });
      console.log('Auction status → Paid');

      return {
        success: true,
        message: 'Ghi nhận thanh toán thành công',
        transaction,
        txHash,
      };
    } catch (error: any) {
      console.error('recordPayment() ERROR:', error.message);
      throw error;
    }
  }

  async confirmReceived(userId: number, address: string, txHash: string) {
    console.log('confirmReceived() STARTED', { userId, address, txHash });

    try {
      // 1. LẤY AUCTION + WINNER
      const auction = await this.prisma.auction.findUnique({
        where: { contractAddress: address },
        select: {
          id: true,
          status: true,
          winner: {
            select: {
              bidderId: true,
              bidder: {
                select: { id: true, wallet: true },
              },
            },
          },
        },
      });

      if (!auction) throw new NotFoundException('Auction not found');
      if (!auction.winner) throw new BadRequestException('Chưa có người thắng');
      if (auction.winner.bidderId !== userId) throw new ForbiddenException('Bạn không phải người thắng');

      // KIỂM TRA WALLET
      const bidderWallet = auction.winner.bidder.wallet;
      if (!bidderWallet) throw new BadRequestException('Chưa liên kết ví');

      // KIỂM TRA TRẠNG THÁI
      if (auction.status === 'Completed') {
        return { success: true, message: 'Đã xác nhận trước đó' };
      }
      if (auction.status !== 'Paid') {
        throw new BadRequestException('Chưa thanh toán – không thể xác nhận');
      }

      // 2. KIỂM TRA txHash ĐÃ TỒN TẠI
      const existingTx = await this.prisma.transaction.findUnique({ where: { txHash } });
      if (existingTx) {
        return { success: true, message: 'Giao dịch đã được ghi nhận' };
      }

      // 3. KIỂM TRA GIAO DỊCH TRÊN CHAIN
      const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        const blockNumber = await provider.getBlockNumber();
        throw new BadRequestException(`Giao dịch chưa confirm. Block hiện tại: ${blockNumber}`);
      }
      if (!receipt.status) {
        throw new BadRequestException('Giao dịch thất bại trên chain');
      }

      // 4. KIỂM TRA TRẠNG THÁI CONTRACT
      const contract = new ethers.Contract(address, this.auctionABI, provider);
      const [isPaid, highestBidder] = await Promise.all([
        contract.isPaidToSeller(),
        contract.highestBidder(),
      ]);

      if (!isPaid) throw new BadRequestException('Chưa thanh toán trên chain');
      if (highestBidder.toLowerCase() !== bidderWallet.toLowerCase()) {
        throw new BadRequestException('Không phải người thắng trên chain');
      }

      // 5. GHI NHẬN DB
      await this.prisma.transaction.create({
        data: this.createTransactionData(
          { txHash, type: 'confirm', amount: 0, toAddress: address },
          userId,
          auction.id,
        ),
      });

      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: 'Completed' },
      });

      return { success: true, message: 'Xác nhận thành công!' };
    } catch (error: any) {
      console.error('confirmReceived() ERROR:', error.message);
      throw error;
    }
  }

  async getAllBids(address: string) {
    const contract = new ethers.Contract(address, this.auctionABI, this.provider);
    const [bidders, amounts, deposits] = await contract.getAllBids();
    return bidders.map((addr: string, i: number) => ({
      bidder: addr,
      amount: ethers.utils.formatEther(amounts[i]),
      deposit: ethers.utils.formatEther(deposits[i]),
    }));
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
}