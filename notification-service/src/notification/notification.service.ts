import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationRecipient } from 'src/notification-recipient/notification-recipient.entity';
import { MessageService } from 'src/message/message.service';

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
      this.logger.log('Nenhuma notificação pendente encontrada.');
      return;
    }

    this.logger.log(
      `🔔 Encontradas ${dueNotifications.length} notificações a serem processadas.`,
    );

    for (const notif of dueNotifications) {
      for (const recipient of notif.recipients) {
        if (recipient.status === 'sent') continue;

        if (recipient.retryCount >= MAX_RETRIES) {
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
    const notifications = await this.notificationRepository.find({
      relations: ['recipients'],
    });

    return notifications.filter(
      (notif) =>
        notif.triggerDates.some(
          (date) => new Date(date).getTime() <= now.getTime(),
        ) && notif.recipients.some((r) => r.status !== 'sent'),
    );
  }

  async sendWhatsAppNotification(numero: string, texto: string) {
    await this.messageService.send(texto, numero);
  }
}
