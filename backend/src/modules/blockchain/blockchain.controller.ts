import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('auction')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // 🟢 Lấy tất cả các phiên đấu giá
  @Get('list')
  async getAllAuctions() {
    return this.blockchainService.getAllAuctions();
  }

  // 🟢 Lấy chi tiết 1 phiên đấu giá (theo contract address)
  @Get(':address/detail')
  async getAuctionDetail(@Param('address') address: string) {
    if (!address) throw new BadRequestException('Missing contract address')
    return this.blockchainService.getAuctionDetail(address);
  }

  // 🟢 Tạo phiên đấu giá mới
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAuction(@Body() body: any, @Req() req: any) {
    const userId = req.user.id;
    return this.blockchainService.createAuction(body, userId);
  }

  // 🟢 Đặt giá (bid)
  @UseGuards(JwtAuthGuard)
  @Post(':address/bid')
  async placeBid(
    @Param('address') address: string,
    @Body('amount') amount: number,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.blockchainService.placeBid(address, amount, userId);
  }

  // 🟢 Lấy danh sách các bid của 1 phiên đấu giá
  @Get(':address/bids')
  async getAllBids(@Param('address') address: string) {
    return this.blockchainService.getAllBids(address);
  }

  // 🟢 Buyer xác nhận đã nhận hàng → trả tiền cho seller
  @UseGuards(JwtAuthGuard)
  @Post(':address/confirm')
  async confirmReceived(@Param('address') address: string, @Req() req: any) {
    const userId = req.user.id;
    return this.blockchainService.confirmReceived(address, userId);
  }
}
