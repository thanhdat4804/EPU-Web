-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "mainImage" TEXT,
ADD COLUMN     "subImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
