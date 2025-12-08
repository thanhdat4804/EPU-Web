// src/modules/user-address/user-address.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Req, UseGuards
} from '@nestjs/common'
import { UserAddressService } from './user-address.service'
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard'

@Controller('user-addresses')
@UseGuards(JwtAuthGuard)
export class UserAddressController {
  constructor(private readonly service: UserAddressService) {}

  @Get()
  getMyAddresses(@Req() req: any) {
    return this.service.getAddresses(req.user.id)
  }

  @Post()
  createAddress(@Req() req: any, @Body() dto: any) {
    return this.service.createAddress(req.user.id, dto)
  }

  @Patch(':id')
  updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateAddress(req.user.id, +id, dto)
  }

  @Delete(':id')
  deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteAddress(req.user.id, +id)
  }

  @Post(':id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.service.setDefaultAddress(req.user.id, +id)
  }
}