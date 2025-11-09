import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  // 🟢 Lưu transaction mới vào DB
  async createTransaction(data: {
    txHash: string;
    fromAddress: string;
    toAddress: string;
    amount: number;
    auctionId?: number;
    type: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        txHash: data.txHash,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amount: data.amount,
        auctionId: data.auctionId ?? null,  // ← SỬA DÒNG NÀY
        type: data.type,
      },
    });
  }

  // 🟢 Lấy danh sách transaction, có thể filter theo auction
  async getTransactions(auctionId?: number) {
    return this.prisma.transaction.findMany({
      where: auctionId ? { auctionId } : {},
      orderBy: { createdAt: 'desc' },
      include: { auction: true },
    });
  }

  // 🟢 Lấy transaction từ blockchain (nếu muốn sync trực tiếp)
  async fetchTransactionFromBlockchain(
    txHash: string,
    provider: ethers.providers.JsonRpcProvider,
  ) {
    const tx = await provider.getTransaction(txHash);
    if (!tx) return null;

    return {
      txHash: tx.hash,
      fromAddress: tx.from,
      toAddress: tx.to || '',
      amount: parseFloat(ethers.utils.formatEther(tx.value)),
    };
  }

  async getTransactionByTxHash(txHash: string) {
  return this.prisma.transaction.findUnique({
    where: { txHash },
    include: { auction: true },
  });
}
}
