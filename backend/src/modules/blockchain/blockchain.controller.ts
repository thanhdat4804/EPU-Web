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

  // 🟢 Chi tiết 1 đấu giá
  @Get(':address/detail')
  async getAuctionDetail(@Param('address') address: string) {
    return this.blockchainService.getAuctionDetail(address);
  }

  // 🟢 Tạo đấu giá
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAuction(@Body() data: any, @Req() req: any) {
    return this.blockchainService.createAuction(data, req.user.id);
  }

  // 🟢 Đặt giá — chỉ cần gửi amount, backend tự tính deposit = 10%
  @UseGuards(JwtAuthGuard)
  @Post(':address/bid')
  async placeBid(
    @Param('address') address: string,
    @Body('amount') amount: number,
    @Req() req: any,
  ) {
    return this.blockchainService.placeBid(address, amount, req.user.id);
  }

  @Post(':address/pay')
  @UseGuards(JwtAuthGuard)
  async payWinningBid(@Param('address') address: string, @Req() req: any) {
    return this.blockchainService.payWinningBid(address, req.user.id);
  }

  // 🟢 Buyer xác nhận nhận hàng
  @UseGuards(JwtAuthGuard)
  @Post(':address/confirm')
  async confirmReceived(@Param('address') address: string, @Req() req: any) {
    return this.blockchainService.confirmReceived(address, req.user.id);
  }

  // 🟢 Mở tranh chấp
  @UseGuards(JwtAuthGuard)
  @Post(':address/dispute')
  async openDispute(@Param('address') address: string, @Req() req: any) {
    return this.blockchainService.openDispute(address, req.user.id);
  }

  // 🟢 Seller hoàn tiền cho buyer
  @UseGuards(JwtAuthGuard)
  @Post(':address/refund')
  async refundBuyer(@Param('address') address: string, @Req() req: any) {
    return this.blockchainService.refundBuyer(address, req.user.id);
  }

  // 🟢 Phạt người thắng không thanh toán
  @Post(':address/penalize')
  async penalizeWinner(@Param('address') address: string) {
    return this.blockchainService.penalizeWinner(address);
  }

  // 🟢 Người thua rút lại cọc
  @UseGuards(JwtAuthGuard)
  @Post(':address/withdraw')
  async withdrawDeposit(@Param('address') address: string, @Req() req: any) {
    return this.blockchainService.withdrawDeposit(address, req.user.id);
  }

  // 🟢 Lấy danh sách đặt giá
  @Get(':address/bids')
  async getAllBids(@Param('address') address: string) {
    return this.blockchainService.getAllBids(address);
  }
}
