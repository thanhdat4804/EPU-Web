// src/modules/favorite/favorite.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: number, auctionId: number) {
    const exists = await this.prisma.favoriteAuction.findUnique({
      where: { userId_auctionId: { userId, auctionId } },
    });

    if (exists) throw new BadRequestException('Đã yêu thích rồi!');

    return this.prisma.favoriteAuction.create({
      data: { userId, auctionId },
      include: { auction: true },
    });
  }

  async removeFavorite(userId: number, auctionId: number) {
    const favorite = await this.prisma.favoriteAuction.findUnique({
      where: { userId_auctionId: { userId, auctionId } },
    });

    if (!favorite) throw new NotFoundException('Chưa yêu thích');

    await this.prisma.favoriteAuction.delete({
      where: { id: favorite.id },
    });

    return { message: 'Đã bỏ yêu thích' };
  }

  async getFavorites(userId: number) {
    return this.prisma.favoriteAuction.findMany({
        where: { userId },
        include: {
        auction: {
            include: {
            item: {
                select: {
                id: true,
                name: true,
                description: true,
                mainImage: true,    
                startingPrice: true,
                estimateMin: true,
                estimateMax: true,
                category: {
                    select: {
                    id: true,
                    name: true,
                    },
                },
                },
            },
            },
        },
        },
        orderBy: { createdAt: 'desc' },
    });
    }

  async isFavorited(userId: number, auctionId: number): Promise<boolean> {
    const count = await this.prisma.favoriteAuction.count({
      where: { userId, auctionId },
    });
    return count > 0;
  }
}