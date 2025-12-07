// src/modules/user-address/user-address.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserAddressService {
  constructor(private prisma: PrismaService) {}

  // LẤY TẤT CẢ ĐỊA CHỈ CỦA USER
  async getAddresses(userId: number) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc', createdAt: 'desc' }
    })
  }

  // THÊM ĐỊA CHỈ MỚI
  async createAddress(userId: number, dto: {
    recipientName: string
    phone: string
    addressLine: string
    ward?: string
    district: string
    city: string
    country?: string
    isDefault?: boolean
  }) {
    const data = { ...dto, userId }

    // Nếu đặt làm mặc định → bỏ mặc định các cái cũ
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      })
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: null } // sẽ cập nhật sau khi tạo
      })
    }

    const address = await this.prisma.userAddress.create({ data })

    // Cập nhật defaultAddressId nếu là mặc định
    if (dto.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: address.id }
      })
    }

    return address
  }

  // SỬA ĐỊA CHỈ
  async updateAddress(userId: number, addressId: number, dto: Partial<{
    recipientName: string
    phone: string
    addressLine: string
    ward?: string
    district: string
    city: string
    country?: string
    isDefault?: boolean
  }>) {
    const address = await this.prisma.userAddress.findUnique({
      where: { id: addressId }
    })

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Địa chỉ không tồn tại')
    }

    // Nếu đổi thành mặc định
    if (dto.isDefault === true) {
      await this.prisma.$transaction([
        this.prisma.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { defaultAddressId: addressId }
        })
      ])
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: dto
    })
  }

  // XÓA ĐỊA CHỈ
  async deleteAddress(userId: number, addressId: number) {
    const address = await this.prisma.userAddress.findUnique({
      where: { id: addressId }
    })

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Địa chỉ không tồn tại')
    }

    if (address.isDefault) {
      throw new BadRequestException('Không thể xóa địa chỉ mặc định')
    }

    return this.prisma.userAddress.delete({
      where: { id: addressId }
    })
  }

  // ĐẶT LÀM MẶC ĐỊNH
  async setDefaultAddress(userId: number, addressId: number) {
    const address = await this.prisma.userAddress.findUnique({
      where: { id: addressId }
    })

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Địa chỉ không tồn tại')
    }

    await this.prisma.$transaction([
      this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      }),
      this.prisma.userAddress.update({
        where: { id: addressId },
        data: { isDefault: true }
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: addressId }
      })
    ])

    return { success: true, message: 'Đã đặt làm địa chỉ mặc định' }
  }
}