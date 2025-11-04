import { Controller, Get, Post, Put, Param, Patch, Body, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🟢 Chỉ admin được phép xem danh sách
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
  
  @Get('me')
  getProfile(@Req() req) {
    return this.userService.getUserFromToken(req.headers.authorization);
  }
  // 🟢 Xem chi tiết user
  @Get(':id')
  
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  // 🗑️ Xóa user
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
  // 🟢 Đổi tên
  @UseGuards(JwtAuthGuard)
  @Put('update-name')
  async updateName(@Req() req, @Body('name') name: string) {
    return this.userService.updateName(req.user.id, name);
  }

  // 🟢 Đổi mật khẩu
  @UseGuards(JwtAuthGuard)
  @Put('update-password')
  async updatePassword(
    @Req() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.updatePassword(req.user.id, body.oldPassword, body.newPassword);
  }
  
   // 🧠 Quên mật khẩu (KHÔNG cần đăng nhập)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.userService.forgotPassword(email);
  }

  // 🧠 Đặt lại mật khẩu (KHÔNG cần đăng nhập)
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.userService.resetPassword(token, newPassword);
  }
}
