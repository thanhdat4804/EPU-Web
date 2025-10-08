import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  // ✅ Gán ví Hardhat cho user theo ID
  @Post('assign/:userId')
  async assignWallet(@Param('userId') userId: string) {
    const address = await this.walletService.assignRandomWalletToUser(Number(userId));
    return { message: 'Wallet assigned successfully', address };
  }

  // ✅ Xem số dư của 1 địa chỉ
  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    const balance = await this.walletService.getBalance(address);
    return { address, balance };
  }

  // ✅ Gửi giao dịch test (ETH từ ví Hardhat)
  @Post('send')
  async sendTransaction(
    @Body() body: { fromPrivateKey: string; to: string; amount: string },
  ) {
    const txHash = await this.walletService.sendTransaction(
      body.fromPrivateKey,
      body.to,
      body.amount,
    );
    return { message: 'Transaction sent', txHash };
  }
}
