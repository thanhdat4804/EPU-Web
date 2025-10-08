import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('auction')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('create')
  async createAuction(@Body() body: { duration: number }) {
    // Gọi blockchain để tạo cuộc đấu giá mới
    const result = await this.blockchainService.createAuction(body.duration);

    // Lấy lại thông tin chi tiết ngay sau khi tạo
    const info = await this.blockchainService.getAuctionInfo(result.address);

    return {
      message: 'Đấu giá tạo thành công!',
      address: result.address,
      info,
    };
  }

  @Get('list')
  async getAllActions() {
    const addresses = await this.blockchainService.getAllActions();
    // 👇 Khai báo kiểu dữ liệu rõ ràng
    const results: {
      address: string;
      highestBid: string;
      highestBidder: string;
      seller: string;
      endTime: string;
    }[] = [];

    for (const addr of addresses) {
      const info = await this.blockchainService.getAuctionInfo(addr);
      results.push({
        address: addr,
        ...info,
      });
    }

    return results;
  }


  @Get('info')
  getAuctionInfo(@Query('address') address: string) {
    return this.blockchainService.getAuctionInfo(address);
  }

  @Post('bid')
  placeBid(@Body() body: { address: string; amount: number }) {
    return this.blockchainService.placeBid(body.address, body.amount);
  }

  @Get('bids')
  getAllBids(@Query('address') address: string) {
    return this.blockchainService.getAllBids(address);
  }
}
