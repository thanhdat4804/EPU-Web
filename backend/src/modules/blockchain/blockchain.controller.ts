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
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('auction')
export class BlockchainController {
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

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,    // 10MB mỗi file
          fieldSize: 50 * 1024 * 1024,   // JSON fields
          files: 6,                      // 1 + 5
        },
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            const ext = extname(file.originalname)
            cb(null, `${unique}${ext}`)
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true)
          } else {
            cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false)
          }
        },
      },
    ),
  )
  async createAuction(
    @UploadedFiles() files: { mainImage?: Express.Multer.File[]; subImages?: Express.Multer.File[] },
    @Body('data') rawData: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    // 1. Parse JSON
    let data: any = {}
    if (!rawData) {
      throw new BadRequestException('Thiếu dữ liệu form')
    }

    try {
      data = JSON.parse(rawData)
    } catch (err) {
      throw new BadRequestException('Dữ liệu JSON không hợp lệ')
    }

    // 2. Convert sang number + validate
    const startingPrice = Number(data.startingPrice)
    const reservePrice = data.reservePrice ? Number(data.reservePrice) : null
    const duration = Number(data.duration)
    const categoryId = Number(data.categoryId)

    if (isNaN(startingPrice) || startingPrice <= 0) {
      throw new BadRequestException('Giá khởi điểm phải là số dương')
    }
    if (reservePrice !== null && (isNaN(reservePrice) || reservePrice < 0)) {
      throw new BadRequestException('Giá sàn không hợp lệ')
    }
    if (isNaN(duration) || duration < 30) {
      throw new BadRequestException('Thời gian đấu giá tối thiểu 30 giây')
    }
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new BadRequestException('Thể loại không hợp lệ')
    }

    // 3. Lấy đường dẫn ảnh
    const mainImagePath = files.mainImage?.[0]?.filename || null
    const subImagePaths = files.subImages?.map(f => f.filename) || []

    if (!mainImagePath) {
      throw new BadRequestException('Vui lòng tải lên ảnh chính')
    }

    // 4. GỌI SERVICE → LƯU VÀO DB
    const result = await this.blockchainService.createAuction(
      {
        name: data.name?.trim(),
        description: data.description?.trim(),
        startingPrice,
        reservePrice,
        duration,
        categoryId,
        contractAddress: data.contractAddress,
        mainImage: mainImagePath,
        subImages: subImagePaths,
      },
      req.user.id,
    )

    // 5. TRẢ VỀ KẾT QUẢ
    return {
      success: true,
      message: 'Tạo đấu giá thành công!',
      contractAddress: result.contractAddress,
      auctionId: result.id,
      redirectUrl: `/auction/${result.contractAddress}`,
    }
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
    return this.blockchainService.getAllBids(address);
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
}
