/*
  Warnings:

  - You are about to drop the column `lasted` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "lasted",
ADD COLUMN     "duration" INTEGER;
