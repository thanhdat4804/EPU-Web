import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // ✅ Lấy toàn bộ danh sách Category (kèm số lượng item)
  async getAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  // category.service.ts
  async getCategoryDetail(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            auction: true, // 🟢 Thêm dòng này để include phiên đấu giá
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy thể loại');
    }

    return category;
  }

  // ✅ Lấy danh sách đấu giá theo category
  async getAuctionsByCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            auction: {
              include: {
                item: true,
                seller: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Lọc ra tất cả các auctions hợp lệ (vì có item chưa có auction)
    const auctions = category.items
      .map((item) => item.auction)
      .filter((auction) => auction !== null);

    return {
      category: { id: category.id, name: category.name },
      auctions,
    };
  }
}
