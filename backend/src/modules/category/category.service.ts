import { Injectable } from '@nestjs/common';
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

  // ✅ Lấy chi tiết 1 Category (bao gồm các Item thuộc category đó)
  async getCategoryDetail(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }
}
