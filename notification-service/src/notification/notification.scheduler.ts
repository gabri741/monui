import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(private readonly notificationService: NotificationService) {}

  // Executa de hora em hora
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleHourlyCheck() {
    this.logger.log('⏰ Executando rotina de verificação de notificações pendentes...');
    await this.notificationService.processPendingNotifications();
  }
}