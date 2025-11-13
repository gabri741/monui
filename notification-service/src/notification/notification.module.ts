import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRecipient } from 'src/notification-recipient/notification-recipient.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationScheduler } from './notification.scheduler';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationRecipient]),
    ScheduleModule.forRoot(),
    MessageModule
          ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationScheduler],
  exports: [NotificationService]
  
})
export class NotificationModule {}
