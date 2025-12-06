import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuctionDto } from '../blockchain/dto/create-auction.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {}

  // // ✅ Lấy tất cả Item (bao gồm category và owner)
  // async getAllItems() {
  //   return this.prisma.item.findMany({
  //     include: {
  //       category: true,
  //       owner: { select: { id: true, name: true, email: true } },
  //       auction: true,
  //     },
  //     orderBy: { createdAt: 'desc' },
  //   });
  // }

  // // ✅ Lấy chi tiết 1 Item theo ID
  // async getItemDetail(id: number) {
  //   const item = await this.prisma.item.findUnique({
  //     where: { id },
  //     include: {
  //       category: true,
  //       owner: { select: { id: true, name: true, email: true } },
  //       auction: true,
  //     },
  //   });

  //   if (!item) throw new NotFoundException('Item not found');
  //   return item;
  // }
  async getMyItems(userId: number) {
    return this.prisma.item.findMany({
      where: { ownerId: userId },
      include: {
        category: {
          select: { id: true, name: true }
        },
        owner: {
          select: { id: true, name: true, wallet: true }
        },
      },
      orderBy: { createdAt: 'desc' }
    })
  }
  // TẠO ITEM MỚI (chờ duyệt)
  async createPendingItem(userId: number, dto: any) {
    return this.prisma.item.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        imageUrl: dto.imageUrl || null,
        mainImage: dto.mainImage,
        subImages: dto.subImages || [],
        startingPrice: Number(dto.startingPrice),
        reservePrice: dto.reservePrice ? Number(dto.reservePrice) : null,
        estimateMin: dto.estimateMin ? Number(dto.estimateMin) : null,
        estimateMax: dto.estimateMax ? Number(dto.estimateMax) : null,
        categoryId: dto.categoryId ? Number(dto.categoryId) : null,
        ownerId: userId,
        status: 'pending',
        duration: dto.duration, // mặc định 7 ngày
      }
    })
  }
  // LẤY DANH SÁCH ITEM CHỜ DUYỆT
  async getPendingItems() {
    return this.prisma.item.findMany({
      where: { status: 'pending' },
      include: {
        owner: { select: { name: true, email: true } },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }
  // LẤY DANH SÁCH ITEM ĐÃ DUYỆT CỦA USER
  async getApprovedItems(userId: number) {
    return this.prisma.item.findMany({
      where: {
        ownerId: userId,
        status: 'approved',
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  }
  // ADMIN: TỪ CHỐI ITEM + GHI LÝ DO
  async rejectItem(itemId: number, reason: string) {
    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item không tồn tại');
    if (item.status !== 'pending') throw new BadRequestException('Item không ở trạng thái chờ duyệt');

    return this.prisma.item.update({
      where: { id: itemId },
      data: { 
        status: 'rejected',
        rejectReason: reason 
      }
    });
  }
  // ADMIN: DUYỆT ITEM
  async approveItem(itemId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Item không tồn tại');
    if (item.status !== 'pending')
      throw new BadRequestException('Item không ở trạng thái chờ duyệt');

    // cập nhật trạng thái
    const updated = await this.prisma.item.update({
      where: { id: itemId },
      data: { status: 'approved' },
    });

    // 🔥 Emit event
    this.eventEmitter.emit('item.approved', {
      userId: item.ownerId,          // người đăng
      itemId: item.id,
      title: item.name,
      image: item.mainImage ?? null,    // hoặc item.images[0] nếu bạn dùng array
    });

    return updated;
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

  // async create(dto: CreateItemDto) {
  //   try {
  //     const item = await this.prisma.item.create({
  //       data: {
  //         name: dto.name,
  //         description: dto.description,
  //         imageUrl: dto.imageUrl,
  //         startingPrice: dto.startingPrice,
  //         // ⚠️ Bạn có thể cần thêm ownerId tạm thời nếu quan hệ yêu cầu
  //         ownerId: 1, // gán user test tạm
  //       },
  //     })
  //     return item
  //   } catch (err) {
  //     console.error('❌ Lỗi khi tạo item:', err)
  //     throw err
  //   }
  // }
  // async findAll() {
  //   return this.prisma.item.findMany()
  // }
  
}
