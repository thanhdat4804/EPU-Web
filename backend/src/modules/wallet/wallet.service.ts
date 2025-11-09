import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';

@Injectable()
export class WalletService {
  private provider: ethers.providers.JsonRpcProvider;
  private fundingWallet: ethers.Wallet;

  constructor(private prisma: PrismaService) {
    // ✅ Kết nối tới local Hardhat hoặc testnet
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    // ✅ Ví nạp ETH mặc định (Hardhat #0)
    const fundingPrivateKey =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.fundingWallet = new ethers.Wallet(fundingPrivateKey, this.provider);
  }

  // ------------------- 🔹 Lấy số dư ví -------------------
  async getBalance(address: string) {
    if (!ethers.utils.isAddress(address)) {
      throw new BadRequestException('Địa chỉ ví không hợp lệ');
    }

    const balanceWei = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balanceWei);
  }

  // ------------------- 🔹 Nạp ETH cho ví người dùng (chỉ khi cần) -------------------
  async fundWallet(address: string, amountEth: string = '1') {
    if (!ethers.utils.isAddress(address)) {
      throw new BadRequestException('Địa chỉ ví không hợp lệ');
    }

    const tx = await this.fundingWallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amountEth),
    });

    await tx.wait();
    return { txHash: tx.hash, amountEth };
  }

  // ------------------- 🔹 Lưu địa chỉ ví từ Metamask -------------------
  async connectWallet(userId: number, walletAddress: string) {
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new BadRequestException('Địa chỉ ví không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    await this.prisma.user.update({
      where: { id: userId },
      data: { wallet: walletAddress },
    });

    return { message: 'Đã liên kết ví thành công', wallet: walletAddress };
  }

  // ------------------- 🔹 Lấy ví người dùng -------------------
  async getUserWallet(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, wallet: true },
    });

    if (!user || !user.wallet) {
      throw new NotFoundException('Người dùng chưa liên kết ví');
    }

    return user;
  }
}
