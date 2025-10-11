import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
@Module({
  imports: [PrismaModule, BlockchainModule, AuthModule, WalletModule, TransactionModule],
})
export class AppModule {}
