import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
})
export class AppModule {}
