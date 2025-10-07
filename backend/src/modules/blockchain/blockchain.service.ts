import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private factory: ethers.Contract;
  private factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // ✅ Factory address cố định

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
    "function actionEndTime() view returns (uint)"
  ];

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    // Private key account đầu tiên của Hardhat
    this.wallet = new ethers.Wallet(
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
      this.provider
    );

    this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.wallet);
  }

  async createAuction(durationSeconds: number) {
    const tx = await this.factory.createAction(durationSeconds);
    const receipt = await tx.wait();

    console.log('📜 All events:', receipt.events);

    let newAuctionAddress = null;

    if (receipt.events && receipt.events.length > 0) {
      for (const ev of receipt.events) {
        // ethers v5
        if (ev.event === 'ActionCreated') {
          newAuctionAddress = ev.args?.actionAddress || ev.args?.[1];
          break;
        }

        // ethers v6 (khi event không có .event name)
        if (ev.topics && ev.topics.length > 0 && ev.data) {
          try {
            const parsed = this.factory.interface.parseLog(ev);
            if (parsed.name === 'ActionCreated') {
              newAuctionAddress = parsed.args.actionAddress;
              break;
            }
          } catch {}
        }
      }
    }

    console.log('✅ New auction address:', newAuctionAddress);

    if (!newAuctionAddress) {
      throw new Error('Không tìm thấy địa chỉ đấu giá mới trong event!');
    }

    return { address: newAuctionAddress, duration: durationSeconds };
  }

  // 🟢 Lấy danh sách tất cả các cuộc đấu giá
  async getAllActions() {
    return this.factory.getAllActions();
  }

  // 🟢 Lấy thông tin chi tiết 1 cuộc đấu giá (theo contractAddress)
  async getAuctionInfo(contractAddress: string) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);

    const [highestBid, highestBidder, seller, endTime] = await Promise.all([
      auction.highestBid(),
      auction.highestBidder(),
      auction.seller(),
      auction.actionEndTime(),
    ]);
    const endTimeNumber = endTime.toNumber ? endTime.toNumber() : Number(endTime);
    const endTimeDate = new Date(endTimeNumber * 1000);
    const remainingSeconds = Math.max(0, Math.floor((endTimeDate.getTime() - Date.now()) / 1000));
    return {
      contractAddress,
      seller,
      endTime: endTimeDate.toLocaleString(), // -> ví dụ "10/7/2025, 1:20:00 PM"
      remainingTime: remainingSeconds, // -> thêm thời gian còn lại
      highestBid: ethers.utils.formatEther(highestBid),
      highestBidder,
    };
  }

  // 🟢 Gửi giá thầu
  async placeBid(contractAddress: string, amountEth: number) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);
    const tx = await auction.bid({
      value: ethers.utils.parseEther(amountEth.toString()),
    });
    await tx.wait();
    return tx.hash;
  }

  // 🟢 Lấy danh sách người tham gia & giá đấu
  async getAllBids(contractAddress: string) {
    const auction = new ethers.Contract(contractAddress, this.auctionABI, this.wallet);
    const [addresses, amounts] = await auction.getAllBids();

    return addresses.map((addr: string, i: number) => ({
      address: addr,
      amount: ethers.utils.formatEther(amounts[i]),
    }));
  }
}
