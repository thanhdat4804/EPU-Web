-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "estimateMax" DOUBLE PRECISION,
ADD COLUMN     "estimateMin" DOUBLE PRECISION,
ADD COLUMN     "reservePrice" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "public"."ReviewResult" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confidence" DOUBLE PRECISION,
    "reasons" TEXT,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewResult_itemId_key" ON "public"."ReviewResult"("itemId");

-- AddForeignKey
ALTER TABLE "public"."ReviewResult" ADD CONSTRAINT "ReviewResult_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
