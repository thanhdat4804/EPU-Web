import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đặt Global để không phải import nhiều lần ở từng module
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Xuất ra để các module khác có thể inject PrismaService
})
export class PrismaModule {}
