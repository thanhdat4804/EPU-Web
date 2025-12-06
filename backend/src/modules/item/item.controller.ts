import { Controller, Get, Param, ParseIntPipe, Query, Post, Put, Body, UseGuards, Req, Patch, BadRequestException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateAuctionDto } from '../blockchain/dto/create-auction.dto';
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      {
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
  async createItem(
    @UploadedFiles()
    files: { mainImage?: Express.Multer.File[]; subImages?: Express.Multer.File[] },
    @Body('data') rawData: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    // === 1. PARSE JSON ===
    if (!rawData) throw new BadRequestException('Thiếu dữ liệu form')

    let data: any
    try {
      data = JSON.parse(rawData)
    } catch (err) {
      throw new BadRequestException('Dữ liệu JSON không hợp lệ')
    }

    // === 2. LẤY ẢNH ===
    const mainImagePath = files.mainImage?.[0]?.filename
    const subImagePaths = files.subImages?.map(f => f.filename) || []

    if (!mainImagePath) {
      throw new BadRequestException('Vui lòng tải lên ảnh chính')
    }

    if (!mainImagePath) throw new BadRequestException('Vui lòng tải lên ảnh chính')

    
    return this.itemService.createPendingItem(req.user.id, {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      mainImage: mainImagePath,
      subImages: subImagePaths,
      startingPrice: Number(data.startingPrice),
      reservePrice: data.reservePrice ? Number(data.reservePrice) : null,
      estimateMin: data.estimateMin ? Number(data.estimateMin) : null,
      estimateMax: data.estimateMax ? Number(data.estimateMax) : null,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      duration: data.duration ? Number(data.duration) : null,
    })
  }

  // LẤY ITEM MỚI (chờ duyệt)
  @Get('approved')
  async getApprovedItems(@Req() req) {
    return this.itemService.getApprovedItems(req.user.id)
  }

  // ADMIN: LẤY DANH SÁCH PENDING
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  async getPendingItems() {
    return this.itemService.getPendingItems()
  }

  // ADMIN: DUYỆT ITEM
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async approveItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.approveItem(id)
  }

  // ADMIN: TỪ CHỐI ITEM
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async rejectItem(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string
  ) {
    return this.itemService.rejectItem(id, reason)
  }
  // ✅ Tìm Item theo tên
   @Get('search/by-name')
  searchByName(@Query('name') name: string) {
    return this.itemService.searchItemByName(name);
  }
  // LẤY DANH SÁCH ITEM ĐÃ DUYỆT CỦA USER
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyItems(@Req() req: Request & { user: { id: number } }) {
    return this.itemService.getMyItems(req.user.id)
  }
}
