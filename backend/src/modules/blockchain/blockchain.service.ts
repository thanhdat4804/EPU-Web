import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { ethers } from 'ethers'
import { PrismaService } from '../../prisma/prisma.service'
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider
  private wallet: ethers.Wallet
  private factory: ethers.Contract

  private factoryAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

  private factoryABI = [
  "function createAction(uint _biddingTime, address _seller) public",
  "function getAllActions() public view returns (address[] memory)",
  "event ActionCreated(address indexed seller, address actionAddress, uint endTime)",
  ];

  private auctionABI = [
    "function bid() payable",
    "function getAllBids() view returns (address[] memory, uint[] memory)",
    "function highestBid() view returns (uint)",
    "function highestBidder() view returns (address)",
    "function seller() view returns (address)",
    "function actionEndTime() view returns (uint)",
    "function ended() view returns (bool)",
    "function finalize() external",
    "function confirmReceived() external",   // ✅ thêm dòng này
    "function refundBuyer() external",       // ✅ và dòng này
    "function withdraw() external returns (bool)", // ✅ optional: nếu bạn gọi withdraw()
    "function pendingReturns(address) view returns (uint256)"
  ];


  constructor(private readonly prisma: PrismaService) {
    // ✅ Cách tạo provider đúng cho Hardhat local
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545', {
      name: 'hardhat',
      chainId: 31337,
    });

    // 🪙 Wallet admin (tài khoản deploy)
    this.wallet = new ethers.Wallet(
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
      this.provider,
    );

    // 🏭 Contract factory
    this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.wallet);
  }
  // 🟢 Tự động hoàn tiền cho người thua
  private async autoRefundLosers(contractAddress: string) {
    try {
      const auctionContract = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);

      // Lấy danh sách bidder & highestBidder
      const [bidders, amounts] = await auctionContract.getAllBids();
      const highestBidder: string = await auctionContract.highestBidder();

      for (let i = 0; i < bidders.length; i++) {
        const bidderAddr: string = bidders[i];
        // bỏ qua winner
        if (bidderAddr.toLowerCase() === highestBidder.toLowerCase()) continue;

        try {
          // Lấy pending amount (BigNumber)
          const pending: ethers.BigNumber = await auctionContract.pendingReturns(bidderAddr);

          if (!pending || pending.lte(0)) {
            // không cần refund
            continue;
          }

          // Tìm user trong DB theo wallet (bạn lưu địa chỉ wallet ở user.wallet)
          const user = await this.prisma.user.findUnique({ where: { wallet: bidderAddr } });
          if (!user || !user.privatekey) {
            console.warn(`No user/privatekey for ${bidderAddr}, skipping refund.`);
            continue;
          }

          // Giải mã private key (dùng hàm decrypt của bạn)
          const decryptedKey = this.decryptPrivateKey(user.privatekey);
          // Tạo signer bằng private key của bidder
          const bidderWallet = new ethers.Wallet(decryptedKey, this.provider);

          // Connect contract với signer (để withdraw với from = bidder)
          const contractWithBidder = auctionContract.connect(bidderWallet);

          console.log(`↩️ Refunding ${ethers.utils.formatEther(pending)} ETH to ${bidderAddr}...`);
          const tx = await contractWithBidder.withdraw();
          const receipt = await tx.wait();
          console.log(`✅ Refunded ${bidderAddr} (tx: ${receipt.transactionHash})`);

          // Tuỳ chọn: lưu transaction vào DB
          await this.prisma.transaction.create({
            data: {
              txHash: receipt.transactionHash,
              fromAddress: bidderAddr,
              toAddress: contractAddress,
              amount: parseFloat(ethers.utils.formatEther(pending)),
              auction: { connect: { contractAddress } },
            }
          });

        } catch (innerErr) {
          console.error(`❌ Refund failed for ${bidderAddr}:`, innerErr?.message || innerErr);
          // tiếp tục với bidder tiếp theo
        }
      }
    } catch (err) {
      console.error(`❌ Auto refund failed for ${contractAddress}:`, err?.message || err);
    }
  }
  @Cron('*/30 * * * * *') // chạy mỗi 30 giây
  async autoFinalizeAuctions() {
    const now = new Date();

    const expiredAuctions = await this.prisma.auction.findMany({
      where: {
        endTime: { lte: now },
        status: 'Active',
      },
    });

    for (const auc of expiredAuctions) {
      try {
        const auctionContract = new ethers.Contract(auc.contractAddress, this.auctionABI, this.wallet);

        const ended = await auctionContract.ended();
        if (!ended) {
          const tx = await auctionContract.finalize();
          await tx.wait();

          await this.prisma.auction.update({
            where: { id: auc.id },
            data: { status: 'Ended' },
          });

          console.log(`✅ Finalized auction: ${auc.contractAddress}`);
          await this.autoRefundLosers(auc.contractAddress);
        }
      } catch (err) {
        console.error(`❌ Failed to finalize ${auc.contractAddress}:`, err.message);
      }
    }
  }
  // 🟢 Tạo đấu giá mới
  async createAuction(data: any, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.wallet) throw new BadRequestException('Seller wallet missing');

    // ✅ Truyền ví của người bán vào contract
    const tx = await this.factory.createAction(data.duration, user.wallet);
    const receipt = await tx.wait();

    let newAuctionAddress: string | null = null;
    for (const ev of receipt.events || []) {
      if (ev.event === 'ActionCreated') {
        newAuctionAddress = ev.args?.actionAddress || ev.args?.[1];
        break;
      }
    }
    if (!newAuctionAddress) throw new Error('Không tìm thấy địa chỉ đấu giá mới!')

    const item = await this.prisma.item.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        startingPrice: data.startingPrice,
        reservePrice: data.reservePrice,
        ownerId: userId,
        status: 'pending',
      },
    })

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + data.duration * 1000)

    const auction = await this.prisma.auction.create({
      data: {
        itemId: item.id,
        sellerId: userId,
        contractAddress: newAuctionAddress,
        startTime,
        endTime,
        status: 'Active',
      },
      include: { item: true },
    })

    return auction
  }

  // 🟢 Lấy danh sách tất cả đấu giá từ DB
  async getAllAuctions() {
    return this.prisma.auction.findMany({
      include: {
        item: true,
        seller: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // 🟢 Chi tiết 1 phiên đấu giá
  async getAuctionDetail(contractAddress: string) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);

    const [highestBid, highestBidder, seller, endTime, ended] = await Promise.all([
      auction.highestBid(),
      auction.highestBidder(),
      auction.seller(),
      auction.actionEndTime(),
      auction.ended(),
    ]);

    // ✅ ép kiểu BigNumber về number
    const endTimestamp = endTime.toNumber ? endTime.toNumber() : Number(endTime);
    const endDate = new Date(endTimestamp * 1000);

    return {
      contractAddress,
      seller,
      highestBid: ethers.utils.formatEther(highestBid),
      highestBidder,
      endTime: endDate.toISOString(), // gửi chuẩn ISO về frontend
      ended,
    };
  }

  async placeBid(contractAddress: string, amount: number, userId: number) {
    const bidder = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!bidder || !bidder.privatekey)
      throw new NotFoundException('Wallet or private key not found')

    // 🔑 Giải mã private key của user
    const decryptedKey = this.decryptPrivateKey(bidder.privatekey)
    const bidderWallet = new ethers.Wallet(decryptedKey, this.provider)

    // 🪙 Gọi contract bằng ví user (không dùng this.wallet nữa)
    const auctionContract = new ethers.Contract(contractAddress, this.auctionABI, bidderWallet)
    const tx = await auctionContract.bid({
      value: ethers.utils.parseEther(amount.toString()),
    })
    await tx.wait()

    if (!bidder.wallet) throw new Error('User wallet not found')

    return this.prisma.transaction.create({
      data: {
        txHash: tx.hash,
        fromAddress: bidder.wallet, // ✅ bây giờ TS biết chắc là string
        toAddress: contractAddress,
        amount,
        auction: { connect: { contractAddress } },
      },
    })
  }
  // 🟢 Lấy tất cả bids
  async getAllBids(contractAddress: string) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet)
    const [addresses, amounts] = await auction.getAllBids()

    const result = addresses.map((addr: string, i: number) => ({
      bidder: addr,
      amount: parseFloat(ethers.utils.formatEther(amounts[i])),
    }))

    return result.sort((a, b) => b.amount - a.amount)
  }
  private decryptPrivateKey(encrypted: string): string {
    const ENCRYPTION_KEY = process.env.PRIVATE_KEY_ENCRYPTION_KEY!
    const IV_LENGTH = 16
    const [ivHex, encryptedText] = encrypted.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv,
    )
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  async confirmReceived(contractAddress: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.privatekey) throw new NotFoundException('User not found or wallet missing')
    console.log('Wallet:', user.wallet)
    // ✅ Giải mã private key trước khi tạo signer
    const decryptedKey = this.decryptPrivateKey(user.privatekey)
    if (!decryptedKey.startsWith('0x')) {
      throw new BadRequestException('Decrypted key invalid format')
    }

    const signer = new ethers.Wallet(decryptedKey, this.provider)
    const auctionContract = new ethers.Contract(contractAddress, this.auctionABI, signer)

    const ended = await auctionContract.ended()
    if (!ended) throw new BadRequestException('Auction has not ended yet')

    const tx = await auctionContract.confirmReceived()
    const receipt = await tx.wait()

    await this.prisma.auction.update({
      where: { contractAddress },
      data: { status: 'Completed' },
    })

    return {
      message: '✅ Payment successfully released to seller!',
      txHash: receipt.transactionHash,
    }
  }
}
