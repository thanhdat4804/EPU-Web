import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auction')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // 🟢 Lấy danh sách đấu giá
  @Get('list')
  async getAllAuctions() {
    return this.blockchainService.getAllAuctions();
  }

  // 🟢 Chi tiết 1 đấu giá (on-chain + DB)
  @Get(':address/detail')
  async getAuctionDetail(@Param('address') address: string) {
    return this.blockchainService.getAuctionDetail(address);
  }

  // 🟢 Tạo đấu giá (dùng admin ví để deploy)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAuction(@Body() data: any, @Req() req: any) {
    return this.blockchainService.createAuction(data, req.user.id);
  }

  // 🟢 Ghi nhận giao dịch đặt giá (MetaMask đã thực hiện on-chain)
  @UseGuards(JwtAuthGuard)
  @Post(':address/record-bid')
  async recordBid(
    @Param('address') address: string,
    @Body() body: { amount: number; txHash: string },
    @Req() req: any,
  ) {
    const { amount, txHash } = body;
    if (!amount || !txHash) {
      throw new Error('Thiếu amount hoặc txHash!');
    }
    return this.blockchainService.recordBid(req.user.id, address, amount, txHash);
  }

  // 🟢 Ghi nhận giao dịch thanh toán (MetaMask đã thực hiện on-chain)
  @UseGuards(JwtAuthGuard)
  @Post(':address/record-payment')
  async recordPayment(
    @Param('address') address: string,
    @Body() body: { txHash: string },
    @Req() req: any,
  ) {
    const { txHash } = body;
    if (!txHash) {
      throw new Error('Thiếu txHash!');
    }
    return this.blockchainService.recordPayment(req.user.id, address, txHash);
  }

  // 🟢 Phạt người thắng không thanh toán (admin cron hoặc manual)
  @Post(':address/penalize')
  async penalizeWinner(@Param('address') address: string) {
    return this.blockchainService.penalizeWinner(address);
  }

  // 🟢 Lấy danh sách đặt giá (on-chain)
  @Get(':address/bids')
  async getAllBids(@Param('address') address: string) {
    return this.blockchainService.getAllBids(address);
  }
}
