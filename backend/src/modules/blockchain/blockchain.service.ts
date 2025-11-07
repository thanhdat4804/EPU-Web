import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
    const seller = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!seller?.wallet) throw new NotFoundException('User wallet not found');

    // Kiểm tra contract có tồn tại không (tùy chọn)
    try {
      const code = await this.provider.getCode(data.contractAddress);
      if (code === '0x') throw new Error('Contract not deployed');
    } catch {
      throw new BadRequestException('Invalid contract address');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.duration * 1000);

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
    if (!this.adminWallet) return;
    const now = new Date();
    const auctions = await this.prisma.auction.findMany({
      where: { status: 'Active', endTime: { lte: now } },
    });

    for (const a of auctions) {
      try {
        const contract = new ethers.Contract(a.contractAddress, this.auctionABI, this.adminWallet);
        const ended = await contract.ended().catch(() => true);
        if (ended) continue;
        const tx = await contract.finalize();
        await tx.wait();
        await this.prisma.auction.update({
          where: { id: a.id },
          data: { status: 'Ended' },
        });
        this.logger.log(`Finalized auction: ${a.contractAddress}`);
      } catch (err: any) {
        this.logger.error(`Finalize error for ${a.contractAddress}: ${err.message}`);
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

  async recordPayment(userId: number, address: string, txHash: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      select: { id: true, sellerId: true, item: { select: { startingPrice: true } } },
    });
    if (!auction) throw new NotFoundException('Auction not found');

    // KIỂM TRA TRÙNG txHash TRONG transaction
    const existingTx = await this.prisma.transaction.findUnique({
      where: { txHash }
    });

    if (existingTx) {
      // ĐÃ TỒN TẠI → TRẢ VỀ THÀNH CÔNG (không lỗi 500)
      return {
        success: true,
        message: 'Giao dịch thanh toán đã được ghi nhận trước đó',
        transaction: existingTx
      };
    }

    // CHƯA TỒN TẠI → TẠO MỚI
    const transaction = await this.prisma.transaction.create({
      data: this.createTransactionData(
        {
          txHash,
          type: 'payment',
          amount: auction.item.startingPrice, // hoặc lấy từ chain
          toAddress: address
        },
        userId,
        auction.id,
      ),
    });

    // CẬP NHẬT TRẠNG THÁI AUCTION
    await this.prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'Paid'},
    });

    return {
      success: true,
      message: 'Ghi nhận thanh toán thành công',
      transaction
    };
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