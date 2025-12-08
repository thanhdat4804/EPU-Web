import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationListener } from './notification.listener';
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, NotificationListener],
})
export class NotificationModule {} 
