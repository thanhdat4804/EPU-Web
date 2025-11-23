import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto'

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

    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  // ✅ Tìm Item theo tên (có thể trả nhiều kết quả gần giống)
  async searchItemByName(name: string) {
    const items = await this.prisma.item.findMany({
      where: {
        name: {
          contains: name, // tìm gần đúng (LIKE)
          mode: 'insensitive', // không phân biệt hoa thường
        },
      },
      include: {
        category: true,
        owner: { select: { id: true, name: true, email: true } },
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (items.length === 0) {
      throw new NotFoundException(`Không tìm thấy vật phẩm nào có tên chứa "${name}"`);
    }

    return items;
  }

  async create(dto: CreateItemDto) {
    try {
      const item = await this.prisma.item.create({
        data: {
          name: dto.name,
          description: dto.description,
          imageUrl: dto.imageUrl,
          startingPrice: dto.startingPrice,
          // ⚠️ Bạn có thể cần thêm ownerId tạm thời nếu quan hệ yêu cầu
          ownerId: 1, // gán user test tạm
        },
      })
      return item
    } catch (err) {
      console.error('❌ Lỗi khi tạo item:', err)
      throw err
    }
  }
  async findAll() {
    return this.prisma.item.findMany()
  }
  
}
