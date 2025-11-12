// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import type { Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🟢 ĐĂNG KÝ – DÙNG DTO + VALIDATION
  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    // ValidationPipe sẽ tự validate → không cần kiểm tra thủ công
    return this.authService.register(registerDto)
  }

  // 🟢 ĐĂNG NHẬP – DÙNG DTO
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  // 🟢 LẤY CSRF TOKEN – CHO FRONTEND
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    // Kiểm tra csurf middleware token
    if (typeof req.csrfToken === 'function') {
      return { csrfToken: req.csrfToken() }
    }

    // Nếu csurf chưa được cấu hình đúng
    throw new BadRequestException(
      'CSRF token không khả dụng — vui lòng kiểm tra middleware csurf trong main.ts',
    )
  }
}