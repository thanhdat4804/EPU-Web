-- CreateTable
CREATE TABLE "public"."FavoriteAuction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "auctionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteAuction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteAuction_userId_auctionId_key" ON "public"."FavoriteAuction"("userId", "auctionId");

-- AddForeignKey
ALTER TABLE "public"."FavoriteAuction" ADD CONSTRAINT "FavoriteAuction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteAuction" ADD CONSTRAINT "FavoriteAuction_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "public"."Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
