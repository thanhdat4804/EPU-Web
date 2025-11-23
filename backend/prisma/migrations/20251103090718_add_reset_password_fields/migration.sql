-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpire" TIMESTAMP(3);
