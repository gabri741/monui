import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationRecipient } from '../notification-recipient/notification-recipient.entity';
import { MessageService } from '../message/message.service';

const MAX_RETRIES = 3;

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationRecipient)
    private readonly recipientRepository: Repository<NotificationRecipient>,
    private readonly messageService: MessageService,
  ) {}

  private readonly logger = new Logger(NotificationService.name);

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const notification = await this.findById(id);
    Object.assign(notification, data);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  /**
   * Processa notificações pendentes e envia para os destinatários.
   */
  async processPendingNotifications(): Promise<void> {
    const now = new Date();
    const dueNotifications = await this.findDueNotifications(now);

    if (dueNotifications.length === 0) {
      return;
    }

    for (const notif of dueNotifications) {
      for (const recipient of notif.recipients) {
        if (recipient.status === 'sent') continue;

        if (recipient.retryCount >= MAX_RETRIES) {
          recipient.status = 'maxtry'
          this.recipientRepository.save(recipient);
             this.logger.warn(
            `🚫 Tentativas esgotadas para ${recipient.phoneNumber}`,
          );
          continue;
        }

        try {
          this.logger.log(
            `Enviando "${notif.body}" para ${recipient.phoneNumber}`,
          );

          await this.sendWhatsAppNotification(
            notif.body,
            recipient.phoneNumber,
          );

          recipient.status = 'sent';
          recipient.lastAttempt = now;
          recipient.retryCount += 1;

          await this.recipientRepository.save(recipient);
          this.logger.log(
            `✅ Notificação enviada com sucesso para ${recipient.phoneNumber}`,
          );
        } catch (error) {
          recipient.status = 'failed';
          recipient.lastAttempt = now;
          recipient.retryCount += 1;
          await this.recipientRepository.save(recipient);
          this.logger.error(
            `❌ Falha ao enviar para ${recipient.phoneNumber}: ${error.message}`,
          );
        }
      }
    }
  }

  /**
   * Busca notificações agendadas para o momento atual.
   * Uma notificação pode ter várias triggerDates — verificamos se alguma é <= agora.
   */
  async findDueNotifications(now = new Date()): Promise<Notification[]> {
  return this.notificationRepository
    .createQueryBuilder('n')
    .leftJoinAndSelect('n.recipients', 'r')
    .where(`
      EXISTS (
        SELECT 1
        FROM unnest(n.triggerDates) AS t(date)
        WHERE t.date <= :now
      )
    `)
    .andWhere(`r.status != 'sent'`)
    .andWhere(`r.status != 'maxtry'`)
    .andWhere(`r.retryCount < 3`)
    .setParameters({ now })
    .getMany();
}

  async sendWhatsAppNotification(numero: string, texto: string) {
    await this.messageService.send(texto, numero);
  }

  async getStatsByUser(userId: string, period: '7d' | '30d' | '90d' = '90d') {
    const daysMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const days = daysMap[period];

    return await this.notificationRepository
      .createQueryBuilder('n')
      .leftJoin('n.recipients', 'r')
      .select('DATE(n.createdAt)', 'date')
      .addSelect(`SUM(CASE WHEN r.status = 'sent' THEN 1 ELSE 0 END)`, 'sent')
      .addSelect(
        `SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END)`,
        'failed',
      )
      .where('n.createdBy = :userId', { userId })
      .andWhere(`n.createdAt >= NOW() - INTERVAL '${days} days'`)
      .groupBy('DATE(n.createdAt)')
      .orderBy('DATE(n.createdAt)', 'ASC')
      .getRawMany();
  }

   async findAllByUserPaginated(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ data: NotificationRecipient[]; total: number }> {
  const query = this.recipientRepository
    .createQueryBuilder('recipient')
    .leftJoinAndSelect('recipient.notification', 'notification')
    .where('notification.createdBy = :userId', { userId })
    .orderBy('recipient.lastAttempt', 'DESC')   // ✔ corrigido
    .skip((page - 1) * limit)
    .take(limit);

  const [data, total] = await query.getManyAndCount();
  return { data, total };
}


}
