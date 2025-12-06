import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  // Get notifications by user ID
  @Get(':userId')
  getByUser(@Param('userId') userId: string) {
    return this.service.findByUser(Number(userId));
  }

  // Mark a notification as read
  @Patch('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(Number(id));
  }

  // Mark all notifications for a user as read 
  @Patch('read-all/:userId')
  markAll(@Param('userId') userId: string) {
    return this.service.markAllAsRead(Number(userId));
  }

  // Delete a notification by ID
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
  // Clear all notifications for a user
  @Delete('clear/:userId')
  clearAll(@Param('userId') userId: string) {
    return this.service.clearAll(Number(userId));
  }
}
