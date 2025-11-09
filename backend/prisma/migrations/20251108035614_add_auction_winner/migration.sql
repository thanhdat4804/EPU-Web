-- CreateTable
CREATE TABLE "public"."AuctionWinner" (
    "id" SERIAL NOT NULL,
    "auctionId" INTEGER NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "bidAmount" DECIMAL(65,30) NOT NULL,
    "txHash" TEXT,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionWinner_auctionId_key" ON "public"."AuctionWinner"("auctionId");

-- AddForeignKey
ALTER TABLE "public"."AuctionWinner" ADD CONSTRAINT "AuctionWinner_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "public"."Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuctionWinner" ADD CONSTRAINT "AuctionWinner_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
