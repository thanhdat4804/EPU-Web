// src/modules/favorite/favorite.controller.ts
import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ToggleFavoriteDto {
  auctionId: number;
}

@Controller('favorites')

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}
  // 🟢 THÊM ĐẤU GIÁ YÊU THÍCH
  @Post()
  @UseGuards(JwtAuthGuard)
  async add(@Req() req, @Body('auctionId') auctionId: number) {
    // Nếu không có auctionId → trả lỗi
    if (!auctionId) {
      throw new BadRequestException('auctionId is required')
    }
    return this.favoriteService.addFavorite(req.user.id, Number(auctionId))
  }
  // 🟢 XÓA ĐẤU GIÁ YÊU THÍCH
  @Delete(':auctionId')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req, @Param('auctionId') auctionId: string) {
    return this.favoriteService.removeFavorite(req.user.id, +auctionId);
  }
  // 🟢 LẤY DANH SÁCH ĐẤU GIÁ YÊU THÍCH CỦA NGƯỜI DÙNG
  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(@Req() req) {
    return this.favoriteService.getFavorites(req.user.id);
  }
  // 🟢 KIỂM TRA ĐẤU GIÁ CÓ TRONG YÊU THÍCH KHÔNG
  @Get('check/:auctionId')
  @UseGuards(JwtAuthGuard)
  async check(@Req() req, @Param('auctionId') auctionId: string) {
    const isFav = await this.favoriteService.isFavorited(req.user.id, +auctionId);
    return { isFavorited: isFav };
  }
  // 🟢 LẤY SỐ LƯỢNG NGƯỜI YÊU THÍCH ĐẤU GIÁ
  @Get('count/:auctionId')
  async getFavoriteCount(
    @Param('auctionId') auctionId: number,
  ) {
    const count = await this.favoriteService.getFavoriteCount(auctionId);
    return { count }; 
  }
}