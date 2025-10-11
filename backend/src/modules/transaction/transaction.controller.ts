import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  async createTransaction(@Body() body: any) {
    // body: { txHash, fromAddress, toAddress, amount, auctionId? }
    return this.transactionService.createTransaction(body);
  }

  @Get('list')
  async getAllTransactions(@Query('auctionId') auctionId?: string) {
    return this.transactionService.getTransactions(
      auctionId ? parseInt(auctionId) : undefined,
    );
  }

  @Get(':txHash')
  async getTransactionDetail(@Param('txHash') txHash: string) {
   return this.transactionService.getTransactionByTxHash(txHash);
  }

}
