import { Injectable, NotFoundException } from '@nestjs/common'
import { ethers } from 'ethers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private factory: ethers.Contract;
  private factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  private factoryABI = [
    "function createAction(uint _biddingTime) public",
    "function getAllActions() public view returns (address[] memory)",
    "event ActionCreated(address indexed seller, address actionAddress, uint endTime)"
  ];

  private auctionABI = [
    "function bid() payable",
    "function getAllBids() view returns (address[] memory, uint[] memory)",
    "function highestBid() view returns (uint)",
    "function highestBidder() view returns (address)",
    "function seller() view returns (address)",
    "function actionEndTime() view returns (uint)",
    "function ended() view returns (bool)"
  ];

  constructor(private readonly prisma: PrismaService) {
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    this.wallet = new ethers.Wallet(
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
      this.provider
    );
    this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.wallet);
  }

  // 🟢 Tạo đấu giá mới
  async createAuction(data: any, userId: number) {
    const tx = await this.factory.createAction(data.duration);
    const receipt = await tx.wait();

    let newAuctionAddress: string | null = null;
    for (const ev of receipt.events || []) {
      if (ev.event === 'ActionCreated') {
        newAuctionAddress = ev.args?.actionAddress || ev.args?.[1];
        break;
      }
    }

    if (!newAuctionAddress) throw new Error('Không tìm thấy địa chỉ đấu giá mới!');

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
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.duration * 1000);

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
    });

    return auction;
  }

  // 🟢 Lấy danh sách tất cả đấu giá từ DB
  async getAllAuctions() {
    const auctions = await this.prisma.auction.findMany({
      include: {
        item: true,
        seller: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Auctions from DB:', auctions);
    return auctions;
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

    return {
      contractAddress,
      seller,
      highestBid: ethers.utils.formatEther(highestBid),
      highestBidder,
      endTime: new Date(Number(endTime) * 1000).toLocaleString('vi-VN'),
      ended,
    };
  }

  async placeBid(contractAddress: string, amount: number, userId: number) {
    // 1. Lấy wallet của bidder
    const bidder = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!bidder || !bidder.wallet)
      throw new NotFoundException('Wallet address not found for bidder')

    // 2. Tạo contract instance và gửi transaction blockchain
    const auctionContract = new ethers.Contract(contractAddress, this.auctionABI, this.wallet)
    const tx = await auctionContract.bid({ value: ethers.utils.parseEther(amount.toString()) })
    await tx.wait()

    // 3. Lưu transaction vào DB
    const transaction = await this.prisma.transaction.create({
      data: {
        txHash: tx.hash,
        fromAddress: bidder.wallet,
        toAddress: contractAddress,
        amount,
        auction: { connect: { contractAddress } }, // kết nối với Auction theo contractAddress
      },
    })

    return transaction
  }

  // 🟢 Lấy danh sách tất cả các bid từ contract
  async getAllBids(contractAddress: string) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);
    const [addresses, amounts] = await auction.getAllBids();

    // Chuyển BigNumber thành ETH rồi sắp xếp giảm dần
    const result = addresses.map((addr: string, i: number) => ({
      bidder: addr,
      amount: parseFloat(ethers.utils.formatEther(amounts[i])),
    }));

    // 🔽 Sắp xếp giảm dần theo số tiền
    result.sort((a, b) => b.amount - a.amount);

    return result;
  }

  
}
