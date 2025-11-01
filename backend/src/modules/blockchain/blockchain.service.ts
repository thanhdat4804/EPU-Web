import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private factory: ethers.Contract;
  private readonly logger = new Logger(BlockchainService.name);
  private factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  private factoryABI = [
    'function createAction(uint _biddingTime, address _seller) public',
    'function getAllActions() public view returns (address[] memory)',
    'event ActionCreated(address indexed seller, address actionAddress, uint endTime)',
  ];

  private auctionABI = [
    'function placeBid(uint _amount) payable',
    'function payWinningBid() payable',
    "function bids(address) view returns (uint amount, uint deposit, bool refunded)",
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
  ];

  constructor(private prisma: PrismaService) {
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545', {
      name: 'hardhat',
      chainId: 31337,
    });

    // ví admin để deploy
    this.wallet = new ethers.Wallet(
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
      this.provider,
    );

    this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.wallet);
  }
  private async refundLosers(auction: ethers.Contract, contractAddress: string) {
    try {
      const [bidders, amounts, deposits] = await auction.getAllBids();
      const highestBidder = await auction.highestBidder();

      for (let i = 0; i < bidders.length; i++) {
        const bidder = bidders[i];
        const deposit = parseFloat(ethers.utils.formatEther(deposits[i]));

        // ❌ Người thua
        if (bidder.toLowerCase() !== highestBidder.toLowerCase()) {
          try {
            const tx = await auction.connect(this.wallet).refundBuyer({
              from: bidder,
              value: 0,
            });
            await tx.wait();
            this.logger.log(`💸 Refunded loser ${bidder} (${deposit} ETH)`);
          } catch (err) {
            this.logger.warn(`⚠️ Refund failed for ${bidder}: ${err.message}`);
          }
        }
      }

      this.logger.log(`✅ All losers refunded for auction: ${contractAddress}`);
    } catch (e) {
      this.logger.error(`❌ refundLosers() error for ${contractAddress}: ${e.message}`);
    }
  }

  // 🕒 Tự động finalize các auction hết hạn
  @Cron(CronExpression.EVERY_MINUTE)
  async autoFinalizeAuctions() {
    const now = new Date();

    const auctions = await this.prisma.auction.findMany({
      where: { status: 'Active', endTime: { lte: now } },
    });

    for (const a of auctions) {
      try {
        const auction = new ethers.Contract(a.contractAddress, this.auctionABI, this.wallet);
        const ended = await auction.ended();
        if (ended) continue;

        // ✅ Gọi finalize trên blockchain
        const tx = await auction.finalize();
        await tx.wait();

        // ✅ Cập nhật DB
        await this.prisma.auction.update({
          where: { id: a.id },
          data: { status: 'Ended' },
        });

        this.logger.log(`✅ Finalized auction: ${a.contractAddress}`);

        // ✅ Gọi refund losers sau khi finalize
        await this.refundLosers(auction, a.contractAddress);

      } catch (e) {
        this.logger.error(`❌ Error finalizing ${a.contractAddress}: ${e.message}`);
      }
    }
  }
  // 🕒 Tự động phạt người thắng nếu không thanh toán
  @Cron(CronExpression.EVERY_MINUTE)
  async autoPenalizeWinners() {
    const now = Math.floor(Date.now() / 1000);

    const auctions = await this.prisma.auction.findMany({
      where: { status: 'Ended' }, // chỉ kiểm tra đấu giá đã kết thúc
    });

    for (const a of auctions) {
      try {
        const auction = new ethers.Contract(a.contractAddress, this.auctionABI, this.wallet);

        const ended = await auction.ended();
        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        const endTime = await auction.actionEndTime();
        const isPaid = await auction.isPaidToSeller?.().catch(() => false);

        // ⛔ Nếu chưa thanh toán & đã quá hạn 1 phút
        if (ended && !isPaid && now > endTime.toNumber() + 60) {
          const tx = await auction.penalizeWinner();
          await tx.wait();

          this.logger.warn(`⚠️ Winner penalized for auction: ${a.contractAddress}`);

          // Cập nhật DB → đấu giá bị hủy, item trả về seller
          await this.prisma.auction.update({
            where: { id: a.id },
            data: { status: 'Penalized' },
          });
        }
      } catch (e) {
        this.logger.error(`❌ autoPenalizeWinners error: ${e.message}`);
      }
    }
  }
  // ======================================
  // 🟢 Lấy danh sách đấu giá
  // ======================================
  async getAllAuctions() {
    return this.prisma.auction.findMany({
      include: { item: true, seller: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ======================================
// 🟢 Chi tiết 1 đấu giá (gồm cả item trong DB)
  // ======================================
  async getAuctionDetail(address: string) {
    // 1️⃣ Lấy dữ liệu blockchain
    const auction = new ethers.Contract(address, this.auctionABI, this.provider);

    const [seller, highestBidder, highestBid, endTime, ended] = await Promise.all([
      auction.seller(),
      auction.highestBidder(),
      auction.highestBid(),
      auction.actionEndTime(),
      auction.ended(),
    ]);

    // 2️⃣ Lấy dữ liệu từ database (Prisma)
    const auctionDb = await this.prisma.auction.findUnique({
      where: { contractAddress: address },
      include: {
        item: true, // ✅ lấy luôn thông tin item
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!auctionDb) throw new NotFoundException('Không tìm thấy đấu giá trong database');

    // 3️⃣ Kết hợp dữ liệu cả hai nguồn
    return {
      contractAddress: address,
      seller: auctionDb.seller,         // thông tin người bán từ DB
      highestBidder,
      highestBid: ethers.utils.formatEther(highestBid),
      endTime: new Date(endTime.toNumber() * 1000).toISOString(),
      ended,
      status: auctionDb.status,
      createdAt: auctionDb.createdAt,
      item: auctionDb.item,             // ✅ Thêm thông tin item
    };
  }
  // ======================================
  // 🟢 Tạo đấu giá mới
  // ======================================
  async createAuction(data: any, userId: number) {
    const seller = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!seller) throw new NotFoundException('Seller not found');

    // 🔑 Gọi hàm factory để deploy Action contract mới
    const tx = await this.factory.createAction(data.duration, seller.wallet);
    const receipt = await tx.wait();

    let newAuctionAddress: string | null = null;
    for (const ev of receipt.events || []) {
      if (ev.event === 'ActionCreated') {
        newAuctionAddress = ev.args?.actionAddress;
        break;
      }
    }

    if (!newAuctionAddress) throw new Error('Không tìm thấy địa chỉ đấu giá mới!');

    // 🕒 Thời gian bắt đầu - kết thúc
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.duration * 1000);

    // 🧩 Lưu vào DB
    const auction = await this.prisma.auction.create({
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
        itemId: undefined, // sẽ tự động điền sau khi tạo item
        seller: { connect: { id: userId } },
        contractAddress: newAuctionAddress,
        startTime,
        endTime,
        status: 'Active',
      },
      include: { item: true, seller: true },
    });

    return auction;
  }

  // ======================================
  // 🟢 Đặt giá (có cọc)
  // ======================================
  async placeBid(address: string, amount: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    // 🔍 Lấy dữ liệu bid cũ (nếu có)
    const bidInfo = await auction.bids(user.wallet);
    const currentDeposit = parseFloat(ethers.utils.formatEther(bidInfo.deposit));

    // 🧮 Tính cọc cần cho giá mới
    const requiredDeposit = amount * 0.1;
    const additionalDeposit = Math.max(requiredDeposit - currentDeposit, 0);

    // 🪙 Gửi phần cọc chênh lệch (nếu có)
    const tx = await auction.placeBid(ethers.utils.parseEther(amount.toString()), {
      value: ethers.utils.parseEther(additionalDeposit.toString()),
    });

    await tx.wait();

    return {
      txHash: tx.hash,
      totalBid: amount,
      additionalDeposit,
      message: `✅ Placed bid successfully. Sent only ${additionalDeposit} ETH extra deposit.`,
    };
  }

  // ======================================
  // 🟢 Thanh toán phần còn lại
  // ======================================
  async payWinningBid(address: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    // 🔍 Lấy thông tin từ contract
    const [highestBid, bidInfo] = await Promise.all([
      auction.highestBid(),
      auction.bids(user.wallet),
    ]);

    const deposit = parseFloat(ethers.utils.formatEther(bidInfo.deposit));
    const totalBid = parseFloat(ethers.utils.formatEther(highestBid));
    const remaining = totalBid - deposit;

    if (remaining <= 0) throw new BadRequestException('Nothing left to pay');

    // 💸 Gửi phần còn lại
    const tx = await auction.payWinningBid({
      value: ethers.utils.parseEther(remaining.toString()),
    });

    await tx.wait();

    return {
      txHash: tx.hash,
      totalBid,
      deposit,
      remaining,
      message: `✅ Paid remaining ${remaining} ETH successfully`,
    };
  }
  // ======================================
  // 🟢 Buyer xác nhận nhận hàng
  // ======================================
  async confirmReceived(address: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    const tx = await auction.confirmReceived();
    await tx.wait();

    return { txHash: tx.hash, message: 'Buyer confirmed received item' };
  }

  // ======================================
  // 🟢 Mở tranh chấp
  // ======================================
  async openDispute(address: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    const tx = await auction.openDispute();
    await tx.wait();

    return { txHash: tx.hash, message: 'Dispute opened successfully' };
  }

  // ======================================
  // 🟢 Seller hoàn tiền cho buyer
  // ======================================
  async refundBuyer(address: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    const tx = await auction.refundBuyer();
    await tx.wait();

    return { txHash: tx.hash, message: 'Buyer refunded' };
  }

  // ======================================
  // 🟢 Phạt người thắng không thanh toán
  // ======================================
  async penalizeWinner(address: string) {
    const auction = new ethers.Contract(address, this.auctionABI, this.wallet);
    const tx = await auction.penalizeWinner();
    await tx.wait();
    return { txHash: tx.hash, message: 'Winner penalized' };
  }

  // ======================================
  // 🟢 Người thua rút lại cọc
  // ======================================
  async withdrawDeposit(address: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new NotFoundException('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const signer = new ethers.Wallet(privateKey, this.provider);
    const auction = new ethers.Contract(address, this.auctionABI, signer);

    const tx = await auction.withdrawDeposit();
    await tx.wait();

    return { txHash: tx.hash, message: 'Deposit withdrawn successfully' };
  }

  // ======================================
  // 🟢 Lấy danh sách bids
  // ======================================
  async getAllBids(address: string) {
    const auction = new ethers.Contract(address, this.auctionABI, this.provider);
    const [bidders, amounts, deposits] = await auction.getAllBids();

    return bidders.map((addr: string, i: number) => ({
      bidder: addr,
      amount: ethers.utils.formatEther(amounts[i]),
      deposit: ethers.utils.formatEther(deposits[i]),
    }));
  }

  // ======================================
  // 🔐 Giải mã private key
  // ======================================
  private decryptPrivateKey(encrypted: string): string {
    const ENCRYPTION_KEY = process.env.PRIVATE_KEY_ENCRYPTION_KEY!;
    const IV_LENGTH = 16;
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
