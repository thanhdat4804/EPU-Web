import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

const IV_LENGTH = 16;
const ENCRYPTION_KEY = process.env.PRIVATE_KEY_ENCRYPTION_KEY!; // 32 bytes hex key

@Injectable()
export class WalletService {
  private provider: ethers.providers.JsonRpcProvider;
  private fundingWallet: ethers.Wallet;

  constructor(private prisma: PrismaService) {
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    // Ví dùng để nạp ETH (Hardhat ví số 1)
    const fundingPrivateKey ='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.fundingWallet = new ethers.Wallet(fundingPrivateKey, this.provider);
  }

  // ------------------- ENCRYPT / DECRYPT -------------------
  private encryptPrivateKey(privateKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv,
    );
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptPrivateKey(encrypted: string): string {
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // ------------------- BALANCE -------------------
  async getBalance(address: string) {
    const balanceWei = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balanceWei);
  }

  // ------------------- SEND TRANSACTION -------------------
  async sendTransaction(fromPrivateKey: string, to: string, amountEth: string) {
    const wallet = new ethers.Wallet(fromPrivateKey, this.provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(amountEth),
    });
    await tx.wait();
    return tx.hash;
  }

  // ------------------- CREATE RANDOM WALLET & FUND -------------------
  private async createRandomWalletAndFund(amountEth: string = '100') {
    const wallet = ethers.Wallet.createRandom().connect(this.provider);

    const tx = await this.fundingWallet.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther(amountEth),
    });
    await tx.wait();

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      txHash: tx.hash,
    };
  }

  // ------------------- ASSIGN RANDOM WALLET TO USER -------------------
  async assignRandomWalletToUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.wallet) return user.wallet; // đã có ví thì trả về luôn

    // Tạo ví random mới + nạp 100 ETH
    const randomWallet = await this.createRandomWalletAndFund('100');

    // Mã hóa private key
    const encryptedPK = this.encryptPrivateKey(randomWallet.privateKey);

    // Cập nhật user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        wallet: randomWallet.address,
        privatekey: encryptedPK,
      },
    });

    return randomWallet.address;
  }

  // ------------------- SEND ETH USING USER WALLET -------------------
  async sendFromUser(userId: number, to: string, amountEth: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.privatekey) throw new Error('User wallet not found');

    const privateKey = this.decryptPrivateKey(user.privatekey);
    const txHash = await this.sendTransaction(privateKey, to, amountEth);
    return txHash;
  }
}
