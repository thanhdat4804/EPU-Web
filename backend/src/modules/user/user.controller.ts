import { Controller, Get, Param, Patch, Body, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🟢 Chỉ admin được phép xem danh sách
  @Get()
  @Roles('Admin')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  // 🟢 Xem chi tiết user
  @Get(':id')
  @Roles('Admin')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  // 🗑️ Xóa user
  @Delete(':id')
  @Roles('Admin')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
