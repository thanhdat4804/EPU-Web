// src/modules/favorite/favorite.controller.ts
import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ToggleFavoriteDto {
  auctionId: number;
}

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Post()
  async add(@Req() req, @Body('auctionId') auctionId: number) {
    // Nếu không có auctionId → trả lỗi
    if (!auctionId) {
      throw new BadRequestException('auctionId is required')
    }
    return this.favoriteService.addFavorite(req.user.id, Number(auctionId))
  }

  @Delete(':auctionId')
  async remove(@Req() req, @Param('auctionId') auctionId: string) {
    return this.favoriteService.removeFavorite(req.user.id, +auctionId);
  }

  @Get()
  async getMyFavorites(@Req() req) {
    return this.favoriteService.getFavorites(req.user.id);
  }

  @Get('check/:auctionId')
  async check(@Req() req, @Param('auctionId') auctionId: string) {
    const isFav = await this.favoriteService.isFavorited(req.user.id, +auctionId);
    return { isFavorited: isFav };
  }
}