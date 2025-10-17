import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  // ✅ Lấy tất cả Item (bao gồm category và owner)
  async getAllItems() {
    return this.prisma.item.findMany({
      include: {
        category: true,
        owner: { select: { id: true, name: true, email: true } },
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Lấy chi tiết 1 Item theo ID
  async getItemDetail(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        owner: { select: { id: true, name: true, email: true } },
        auction: true,
      },
    });

    if (!item) throw new Error('Item not found');
    return item;
  }
}
