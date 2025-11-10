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
    return this.prisma.user.findMany({
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

        // 🟢 Vật phẩm mà user sở hữu (người bán)
        items: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },

        // 🟢 Các cuộc đấu giá do user tạo (người bán)
        auctions: {
          select: {
            id: true,
            contractAddress: true,
            status: true,
            createdAt: true,
            item: {   // Thêm item liên kết với auction
              select: {
                id: true,
                name: true,
                imageUrl: true,
                startingPrice: true,
              },
            },
          },
        },

        // 🟢 Các phiên đấu giá user đã tham gia (người mua)
        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            auction: { // Nối sang bảng auction
              select: {
                id: true,
                contractAddress: true,
                status: true,
                item: { // Và nối tiếp sang bảng item
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

    return user;
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
