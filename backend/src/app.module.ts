// src/app.module.ts
import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { BlockchainModule } from './modules/blockchain/blockchain.module'
import { AuthModule } from './modules/auth/auth.module'
import { WalletModule } from './modules/wallet/wallet.module'
import { TransactionModule } from './modules/transaction/transaction.module'
import { UserModule } from './modules/user/user.module'
import { CategoryModule } from './modules/category/category.module'
import { ItemModule } from './modules/item/item.module'
import { ScheduleModule } from '@nestjs/schedule'

// 🟢 CÁCH 2: DÙNG ServeStaticModule
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { FavoriteModule } from './modules/favorite/favorite.module'

@Module({
  imports: [
    // 1. Schedule
    ScheduleModule.forRoot(),

    // 2. Core Modules
    PrismaModule,
    BlockchainModule,
    AuthModule,
    WalletModule,
    TransactionModule,
    UserModule,
    CategoryModule,
    ItemModule,
    FavoriteModule,
    // 3. CÁCH 2: PHỤC VỤ ẢNH TỪ THƯ MỤC uploads/
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Đường dẫn tuyệt đối đến thư mục uploads/
      serveRoot: '/uploads',// URL: http://localhost:3001/uploads/xxx.jpg
      serveStaticOptions: {
        index: false,// Không cho truy cập index.html
        cacheControl: true,// Bật cache
        maxAge: 31536000,// Cache 1 năm (tùy chọn)
      },
    }),
  ],
})
export class AppModule {}