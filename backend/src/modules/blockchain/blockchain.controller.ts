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
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB mỗi file
          files: 6, // 1 + 5
        },
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = extname(file.originalname);
            cb(null, `${unique}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
          }
        },
      },
    ),
  )
  async createAuction(
    @UploadedFiles()
    files: { mainImage?: Express.Multer.File[]; subImages?: Express.Multer.File[] },
    @Body('data') rawData: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    // === 1. PARSE JSON ===
    if (!rawData) {
      throw new BadRequestException('Thiếu dữ liệu form');
    }

    let data: any;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      throw new BadRequestException('Dữ liệu JSON không hợp lệ');
    }

    // === 2. LẤY ẢNH ===
    const mainImagePath = files.mainImage?.[0]?.filename;
    const subImagePaths = files.subImages?.map((f) => f.filename) || [];

    if (!mainImagePath) {
      throw new BadRequestException('Vui lòng tải lên ảnh chính');
    }

    // === 3. CHUẨN HÓA + VALIDATE DỮ LIỆU ===
    const startingPrice = Number(data.startingPrice);
    const reservePrice = data.reservePrice != null ? Number(data.reservePrice) : null;
    const duration = Number(data.duration);
    const categoryId = data.categoryId != null ? Number(data.categoryId) : undefined;

    const estimateMin = data.estimateMin != null ? Number(data.estimateMin) : null;
    const estimateMax = data.estimateMax != null ? Number(data.estimateMax) : null;

    // Validate số
    if (isNaN(startingPrice) || startingPrice <= 0) {
      throw new BadRequestException('Giá khởi điểm phải là số dương');
    }
    if (reservePrice !== null && (isNaN(reservePrice) || reservePrice < 0)) {
      throw new BadRequestException('Giá sàn không hợp lệ');
    }
    if (isNaN(duration) || duration < 30) {
      throw new BadRequestException('Thời gian đấu giá tối thiểu 30 giây');
    }
    if (categoryId !== undefined && (isNaN(categoryId) || categoryId <= 0)) {
      throw new BadRequestException('Thể loại không hợp lệ');
    }
    if (estimateMin !== null && isNaN(estimateMin)) {
      throw new BadRequestException('estimateMin không hợp lệ');
    }
    if (estimateMax !== null && isNaN(estimateMax)) {
      throw new BadRequestException('estimateMax không hợp lệ');
    }
    if (estimateMin !== null && estimateMax !== null && estimateMin > estimateMax) {
      throw new BadRequestException('estimateMin phải nhỏ hơn hoặc bằng estimateMax');
    }

    // === 4. TẠO DTO CHO SERVICE ===
    const dto: CreateAuctionDto = {
      name: data.name?.trim() || '',
      description: data.description?.trim(),
      imageUrl: data.imageUrl?.trim() || null,
      startingPrice,
      reservePrice,
      estimateMin,
      estimateMax,
      mainImage: mainImagePath,
      subImages: subImagePaths,
      categoryId,
      duration,
      contractAddress: data.contractAddress,
      // KHÔNG GỬI ownerId → service dùng req.user.id
    };

    // === 5. GỌI SERVICE ===
    const result = await this.blockchainService.createAuction(dto, req.user.id);

    // === 6. TRẢ VỀ KẾT QUẢ ===
    return {
      success: true,
      message: 'Tạo đấu giá thành công!',
      contractAddress: result.contractAddress,
      auctionId: result.id,
      redirectUrl: `/auction/${result.contractAddress}`,
    };
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
