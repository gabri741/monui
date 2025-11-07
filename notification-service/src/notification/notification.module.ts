import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRecipient } from 'src/notification-recipient/notification-recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationRecipient])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
