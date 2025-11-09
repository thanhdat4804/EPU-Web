import { Controller, Post, Body, Get, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import type { Request } from 'express' // ✅ chỉ import type để tránh lỗi TS1272

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(name, email, password)
  }

  @Post('login')
  login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password)
  }

  // ✅ GET /auth/csrf-token — trả token cho frontend
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    if (typeof req.csrfToken === 'function') {
      return { csrfToken: req.csrfToken() }
    }
    return {
      csrfToken: null,
      message: 'CSRF token unavailable — please check csurf middleware setup',
    }
  }
}
