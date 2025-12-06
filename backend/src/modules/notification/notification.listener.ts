import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationListener.name);
  

  constructor(
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.handleEvents();
    this.logger.log('NotificationListener initialized and listening to events');
  }

  private handleEvents() {
    // ---------- 1. Item Approved ----------
    this.eventEmitter.on('item.approved', async (payload: any) => {
      try {
        if (!payload?.userId || !payload?.itemId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.userId } },
            title: 'Item Approved',
            message: `Your item "${payload.title ?? 'Untitled'}" has been approved.`,
            image: payload.image ?? null,
            link: `/user/my_auction`,
            type: 'ITEM_APPROVED',
            targetType: 'item',
            targetId: payload.itemId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling item.approved: ${err?.message ?? err}`);
      }
    });

    // ---------- 2. Auction Rejected ----------
    this.eventEmitter.on('item.rejected', async (payload: any) => {
      try {
        if (!payload?.userId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.userId } },
            title: 'Auction Rejected',
            message: `Your auction "${payload.title ?? 'Untitled'}" was rejected. Reason: ${payload.reason ?? 'No reason provided'}`,
            image: payload.image ?? null,
            link: `/user/my_auction`,
            type: 'AUCTION_REJECTED',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling auction.rejected: ${err?.message ?? err}`);
      }
    });

    // ---------- 3. New Bid ----------
    this.eventEmitter.on('bid.created', async (payload: any) => {
      try {
        if (!payload?.sellerId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.sellerId } },
            title: 'New Bid Placed',
            message: `Your auction "${payload.title ?? 'Untitled'}" has a new bid.`,
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/auction/${payload.auctionId}`,
            type: 'NEW_BID',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling bid.created: ${err?.message ?? err}`);
      }
    });

    // ---------- 4. Outbid ----------
    this.eventEmitter.on('bid.outbid', async (payload: any) => {
      try {
        if (!payload?.oldBidderId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.oldBidderId } },
            title: 'You Were Outbid',
            message: `Someone placed a higher bid on "${payload.title ?? 'Untitled'}".`,
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/auction/${payload.auctionId}`,
            type: 'OUTBID',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling bid.outbid: ${err?.message ?? err}`);
      }
    });

    // ---------- 5. Auction Ending Soon ----------
    this.eventEmitter.on('auction.ending', async (payload: any) => {
      try {
        if (!payload?.userId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.userId } },
            title: 'Auction Ending Soon',
            message: `"${payload.title ?? 'Untitled'}" will end in ${payload.minutes ?? 'a few'} minutes.`,
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/auction/${payload.auctionId}`,
            type: 'AUCTION_ENDING',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling auction.ending: ${err?.message ?? err}`);
      }
    });

    // ---------- 6. Auction Finished ----------
    this.eventEmitter.on('auction.finished', async (payload: any) => {
      try {
        if (!payload?.auctionId || !payload?.sellerId || typeof payload?.winnerId === 'undefined') return;

        // Winner notification
        if (payload.winnerId) {
          await this.prisma.notification.create({
            data: {
              user: { connect: { id: payload.winnerId } },
              title: '🎉 You Won an Auction',
              message: `You won "${payload.title ?? 'Untitled'}". Please complete payment to claim the item.`,
              image: payload.image ?? null,
              link: `/user/winning_auction`,
              type: 'AUCTION_WON',
              targetType: 'auction',
              targetId: payload.auctionId,
            },
          });

          // Seller notification
          await this.prisma.notification.create({
            data: {
              user: { connect: { id: payload.sellerId } },
              title: 'Auction Finished',
              message: `Your auction "${payload.title ?? 'Untitled'}" has ended and a winner was found.`,
              image: payload.image ?? null,
              link: `/user/my_auction`,
              type: 'AUCTION_FINISHED',
              targetType: 'auction',
              targetId: payload.auctionId,
            },
          });

          return;
        }

        // No winner
        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.sellerId } },
            title: 'Auction Ended With No Winner',
            message: `Your auction "${payload.title ?? 'Untitled'}" ended but there were no valid bids.`,
            image: payload.image ?? null,
            link: `/user/my_auction`,
            type: 'AUCTION_NO_WINNER',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling auction.finished: ${err?.message ?? err}`);
      }
    });

    // ---------- 7. Payment Required ----------
    this.eventEmitter.on('payment.required', async (payload: any) => {
      try {
        if (!payload?.userId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.userId } },
            title: 'Payment Required',
            message: `Please complete payment for "${payload.title ?? 'Untitled'}".`,
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/payment/${payload.auctionId}`,
            type: 'PAYMENT_REQUIRED',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling payment.required: ${err?.message ?? err}`);
      }
    });

    // ---------- 8. Payment Completed ----------
    this.eventEmitter.on('payment.completed', async (payload: any) => {
      try {
        if (!payload?.sellerId || !payload?.auctionId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.sellerId } },
            title: 'Payment Completed',
            message: `Buyer has completed payment for "${payload.title ?? 'Untitled'}".`,
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/auction/${payload.auctionId}`,
            type: 'PAYMENT_COMPLETED',
            targetType: 'auction',
            targetId: payload.auctionId,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling payment.completed: ${err?.message ?? err}`);
      }
    });

    // ---------- 9. Admin Message ----------
    this.eventEmitter.on('admin.message', async (payload: any) => {
      try {
        if (!payload?.userId) return;

        await this.prisma.notification.create({
          data: {
            user: { connect: { id: payload.userId } },
            title: payload.title ?? 'Message from Admin',
            message: payload.message ?? '',
            image: payload.image ?? null,
            link: payload.link ? `${payload.link}` : `/`,
            type: 'ADMIN_MESSAGE',
            targetType: payload.targetType ?? 'system',
            targetId: payload.targetId ?? 0,
          },
        });
      } catch (err: any) {
        this.logger.error(`Error handling admin.message: ${err?.message ?? err}`);
      }
    });
  }
}
