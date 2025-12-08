import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // 🟢 Lấy danh sách người dùng (ẩn thông tin nhạy cảm)
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const sellerIds = users.map(u => u.id)
    if (sellerIds.length === 0) {
      return users.map(u => ({ ...u, sellerStats: null }))
    }

    // 1. THỐNG KÊ AUCTION THEO STATUS
    const auctionStats = await this.prisma.auction.groupBy({
      by: ['sellerId', 'status'],
      where: { sellerId: { in: sellerIds } },
      _count: { _all: true },
    })

    // 2. DOANH THU + SỐ PHIÊN BÁN THÀNH CÔNG (Paid)
    // Prisma không cho groupBy qua relation → dùng raw query hoặc cách khác
    // → DÙNG CÁCH AN TOÀN NHẤT: LẤY TẤT CẢ WINNER RỒI GOM NHÓM BẰNG JS
    const winners = await this.prisma.auctionWinner.findMany({
      where: {
        auction: {
          sellerId: { in: sellerIds },
          status: 'Completed',
        },
      },
      select: {
        bidAmount: true,
        auction: {
          select: { sellerId: true }
        }
      }
    })

    // Gom nhóm doanh thu bằng JS (siêu nhanh, siêu chuẩn)
    const revenueMap = new Map<number, { revenue: number; sold: number }>()

    for (const w of winners) {
      const sellerId = w.auction.sellerId
      const current = revenueMap.get(sellerId) || { revenue: 0, sold: 0 }
      current.revenue += Number(w.bidAmount || 0)
      current.sold += 1
      revenueMap.set(sellerId, current)
    }

    // 3. TẠO MAP THỐNG KÊ CHO TỪNG SELLER
    const statsMap = new Map<number, any>()

    for (const userId of sellerIds) {
      statsMap.set(userId, {
        totalAuctions: 0,
        activeAuctions: 0,
        endedAuctions: 0,
        totalRevenue: '0.0000',
        auctionsSold: 0,
        currency: 'ETH',
      })
    }

    // Điền số lượng auction
    for (const stat of auctionStats) {
      const s = statsMap.get(stat.sellerId)!
      s.totalAuctions += stat._count._all

      if (stat.status === 'Active') {
        s.activeAuctions += stat._count._all
      } else if (['Completed', 'Penalized', 'PenalizedSeller'].includes(stat.status)) {
        s.endedAuctions += stat._count._all
      }
    }

    // Điền doanh thu từ revenueMap
    for (const [sellerId, data] of revenueMap) {
      const s = statsMap.get(sellerId)!
      s.totalRevenue = data.revenue.toFixed(4)
      s.auctionsSold = data.sold
    }

    // Gắn vào user
    return users.map(user => ({
      ...user,
      sellerStats: statsMap.get(user.id) || null,
    }))
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
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },

        auctions: {
          select: {
            id: true,
            contractAddress: true,
            status: true,
            createdAt: true,
            item: {
              select: {
                id: true,
                name: true,
                mainImage: true,
                startingPrice: true,
              },
            },
          },
        },

        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            auction: {
              select: {
                id: true,
                contractAddress: true,
                status: true,
                item: {
                  select: {
                    id: true,
                    name: true,
                    startingPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // THỐNG KÊ BÁN HÀNG – SIÊU CHUẨN THEO Ý HOÀNG ĐẾ
    const auctionStats = await this.prisma.auction.groupBy({
      by: ['status'],
      where: { sellerId: id },
      _count: { id: true },
    });

    // Doanh thu + số phiên bán thành công (chỉ tính khi Paid)
    const winnerStats = await this.prisma.auctionWinner.aggregate({
      where: {
        auction: {
          sellerId: id,
          status: 'Completed',
        },
      },
      _sum: { bidAmount: true },
      _count: { id: true },
    });

    // Tính số lượng theo từng trạng thái
    const getCount = (status: string) =>
      auctionStats.find(s => s.status === status)?._count.id || 0

    const stats = {
      totalAuctions: auctionStats.reduce((sum, s) => sum + s._count.id, 0),
      activeAuctions: getCount('Active'),
      
      // ĐÃ KẾT THÚC = Completed + Penalized + PenalizedSeller
      endedAuctions: 
        getCount('Completed') + 
        getCount('Penalized') + 
        getCount('PenalizedSeller'),

      // Doanh thu + số phiên bán thành công
      totalRevenue: winnerStats._sum.bidAmount
        ? Number(winnerStats._sum.bidAmount).toFixed(4)
        : '0.0000',
      auctionsSold: winnerStats._count.id || 0,
      currency: 'ETH',
    }

    return {
      ...user,
      sellerStats: stats,
    }
  }


  // 🗑️ Xóa user
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  // 🟢 Lấy user từ token
  async getUserFromToken(authHeader: string) {
    this.logger.debug(`🔍 Received Authorization Header: ${authHeader}`);
    if (!authHeader) throw new UnauthorizedException('Thiếu token');

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      throw new UnauthorizedException('Sai định dạng token');

    const token = parts[1];
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, wallet: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // 🟢 Đổi tên người dùng
  async updateName(userId: number, newName: string) {
    if (!newName || newName.trim().length < 2) {
      throw new BadRequestException('Tên không hợp lệ');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { name: newName.trim() },
      select: { id: true, name: true, email: true },
    });

    this.logger.log(`✏️ User ${userId} đổi tên thành "${updated.name}"`);
    return updated;
  }

  // 🟢 Đổi mật khẩu
  async updatePassword(userId: number, oldPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu cũ không đúng');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    this.logger.log(`🔐 User ${userId} đổi mật khẩu thành công`);
    return { message: 'Đổi mật khẩu thành công' };
  }
  // 🟢 Yêu cầu đặt lại mật khẩu
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng với email này');

    // 🔐 Tạo mã token reset (ngẫu nhiên)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // 💾 Lưu vào DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpire,
      },
    });

    // 📧 Gửi email (hoặc log ra console)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log(`🔗 Reset link: ${resetUrl}`);

    // Gửi email (ví dụ dùng Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'thanhdat4804@gmail.com',
        pass: 'owjwamcqarelmhqr',
      },
    });

    await transporter.sendMail({
      from: '"EPU Auction" <no-reply@epu-auction.com>',
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Nhấn vào liên kết sau để đặt lại mật khẩu (hết hạn sau 15 phút):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    return { message: 'Đã gửi link đặt lại mật khẩu tới email của bạn' };
  }

  // 🟢 Đặt lại mật khẩu (qua token)
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpire: { gt: new Date() }, // Token còn hạn
      },
    });

    if (!user) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Cập nhật mật khẩu mới và xóa token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpire: null,
      },
    });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

}
