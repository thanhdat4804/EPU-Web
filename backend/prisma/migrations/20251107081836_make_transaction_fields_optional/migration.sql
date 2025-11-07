/*
  Warnings:

  - A unique constraint covering the columns `[txHash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "txHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "public"."Transaction"("txHash");
