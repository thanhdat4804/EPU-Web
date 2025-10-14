import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Lấy danh sách người dùng (ẩn thông tin nhạy cảm)
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 🟢 Lấy thông tin chi tiết 1 user
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true,
        items: {
          select: { id: true, name: true, status: true, createdAt: true },
        },
        auctions: {
          select: { id: true, contractAddress: true, status: true, createdAt: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // 🗑️ Xóa user (cẩn thận khi dùng)
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }
}
