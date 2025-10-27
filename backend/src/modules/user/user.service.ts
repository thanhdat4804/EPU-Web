import { Injectable, NotFoundException, UnauthorizedException, Logger  } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService, private jwtService: JwtService,) {}

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
  // 🟢 Lấy thông tin từ token kèm debug
  async getUserFromToken(authHeader: string) {
    this.logger.debug(`🔍 Received Authorization Header: ${authHeader}`);
    if (!authHeader) {
      this.logger.warn('⛔ Missing Authorization header');
      throw new UnauthorizedException('Thiếu token');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn(`⛔ Wrong token format: ${authHeader}`);
      throw new UnauthorizedException('Sai định dạng token (phải là Bearer <token>)');
    }
    const token = parts[1];
    this.logger.debug(`🔑 Extracted Token: ${token}`);
    let payload;
    try {
      payload = this.jwtService.verify(token);
      this.logger.debug(`✅ Decoded Payload: ${JSON.stringify(payload)}`);
    } catch (err) {
      this.logger.error(`❌ JWT Verify FAILED: ${err.message}`);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    const userId = payload.sub;
    this.logger.debug(`👤 Extracted userId: ${userId}`);
    if (!userId) {
      this.logger.error('❌ Token missing sub field');
      throw new UnauthorizedException('Token không chứa userId');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true,
      },
    });
    this.logger.debug(`📦 DB Query Result: ${JSON.stringify(user)}`);
    if (!user) {
      this.logger.warn(`⚠ User with ID ${userId} not found in DB`);
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    this.logger.log(`✅ User Authenticated: ${user.email}`);
    return user;
  }
}
