import { Controller, Get, Post, Body, Query, Req, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlockchainService } from './blockchain.service';

@Controller('auction')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAuction(@Body() body: any, @Req() req) {
    const userId = req.user.userId;
    return this.blockchainService.createAuction(body, userId);
  }

  @Get('list')
  async getAllAuctions() {
    return this.blockchainService.getAllAuctions();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':contractAddress/bid')
  async placeBid(
    @Param('contractAddress') contractAddress: string,
    @Body('amount') amount: number,
    @Req() req: any, // req.user sẽ có sub = userId
  ) {
    const userId = req.user.userId // lấy userId từ JWT
    return this.blockchainService.placeBid(contractAddress, amount, userId)
  }

  @Get(':address/bids')
  async getAllBids(@Param('address') address: string) {
    return this.blockchainService.getAllBids(address);
  }

  @Get(':address')
  async getAuctionDetail(@Param('address') address: string) {
    return this.blockchainService.getAuctionDetail(address);
  }
}
