-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "public"."Transaction_txHash_key";

-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "fromAddress" DROP NOT NULL,
ALTER COLUMN "toAddress" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
