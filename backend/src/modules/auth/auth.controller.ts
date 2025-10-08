import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Đăng ký
  @Post('register')
  async register(@Body() body: any) {
    const { name, email, password } = body;
    return this.authService.register(name, email, password);
  }
  
  //Đăng nhập
  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }
}
