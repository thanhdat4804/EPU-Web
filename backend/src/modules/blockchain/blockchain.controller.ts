import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CreateAuctionDto } from './dto/create-auction.dto';
@Controller('auction')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);
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

  @Post('create-from-item')
  @UseGuards(JwtAuthGuard)
  async createFromItem(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { itemId: number; contractAddress: string; txHash: string }
  ) {
    return this.blockchainService.createAuctionFromApprovedItem(req.user.id, body)
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
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return []; // Trả mảng rỗng nếu address sai
      }
      const bids = await this.blockchainService.getAllBids(address);
      return bids; // Luôn trả mảng (có thể rỗng)
    } catch (error: any) {
      this.logger.warn(`getAllBids(${address}) failed: ${error.message}`);
      return []; // QUAN TRỌNG: TRẢ [] THAY VÌ 500
    }
  }
  
  // 🟢 Lấy danh sách đấu giá của user (DB)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyAuctions(@Req() req: any) {
    return this.blockchainService.getMyAuctions(req.user.userId);
  }
  
  // 🟢 Lấy danh sách đấu giá thắng của user (DB)
  @UseGuards(JwtAuthGuard)
  @Get('my-wins')
  async getMyWinningAuctions(@Req() req: any) {
    return this.blockchainService.getWinningAuctions(req.user.id);
  }

  // 🟢 Xác nhận đã nhận hàng (sau khi người thắng đã thanh toán)
  @UseGuards(JwtAuthGuard)
  @Post(':address/confirm')
  async confirmReceived(
    @Param('address') address: string,
    @Body('txHash') txHash: string,
    @Req() req: any,
  ) {
    return this.blockchainService.confirmReceived(req.user.id, address, txHash);
  }

  @Post(':address/confirm-shipped')
  @UseGuards(JwtAuthGuard)
  async confirmShipped(
    @Req() req: any,
    @Param('address') address: string,
    @Body('txHash') txHash: string,
  ) {
    return this.blockchainService.confirmShippedBySeller(req.user.id, address, txHash);
  }
}
