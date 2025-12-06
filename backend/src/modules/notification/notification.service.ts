import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Tạo thông báo
  create(body: any) {
    return this.prisma.notification.create({
      data: {
        user: { connect: { id: body.userId } }, // ⬅️ FIX 100% đúng Prisma
        type: body.type,
        title: body.title,
        message: body.message,
        image: body.image ?? null,
        targetType: body.targetType,
        targetId: body.targetId,
        link: body.link,
      },
    });
  }

  // Lấy thông báo theo user
  findByUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Đánh dấu đã đọc
  markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Đánh dấu tất cả đã đọc
  markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  // Xóa 1 thông báo
  delete(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Xóa tất cả thông báo của user
  clearAll(userId: number) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
