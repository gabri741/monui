import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRecipient } from './notification-recipient.entity';
import { Notification } from '../notification/notification.entity';


@Module({
  imports: [TypeOrmModule.forFeature([NotificationRecipient, Notification])],
})
export class NotificationRecipientModule {}
