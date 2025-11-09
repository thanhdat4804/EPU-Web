import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  // ✅ Xem số dư của 1 địa chỉ
  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    const balance = await this.walletService.getBalance(address);
    return { address, balance };
  }
  // ✅ Kết nối ví Metamask
  @Post('connect')
  async connectWallet(@Body() body: { userId: number; wallet: string }) {
    return this.walletService.connectWallet(body.userId, body.wallet);
  }
  // ✅ Lấy địa chỉ ví của người dùng
  @Get(':userId')
  async getWallet(@Param('userId') userId: number) {
    return this.walletService.getUserWallet(Number(userId));
  }
}
