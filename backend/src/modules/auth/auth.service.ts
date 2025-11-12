import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Wallet } from 'ethers';
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password, confirmPassword } = dto

    // 1. Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng')
    }

    // 2. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Tạo user
    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        wallet: null,
        role: 'User',
      },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true,
      },
    })

    // 4. Tạo JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      wallet: user.wallet,
    }

    const token = await this.jwtService.signAsync(payload)

    // 5. Trả về
    return {
      message: 'Đăng ký thành công!',
      token,
      user,
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto

    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        wallet: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    }

    // 3. Tạo payload JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      wallet: user.wallet,
    }

    // 4. Tạo token
    const token = await this.jwtService.signAsync(payload)

    // 5. Trả về user (không có password)
    const { password: _, ...userWithoutPassword } = user

    return {
      token,
      user: userWithoutPassword,
      message: 'Đăng nhập thành công!',
    }
  }
}
