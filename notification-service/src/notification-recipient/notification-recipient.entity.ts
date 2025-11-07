import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Notification } from '../notification/notification.entity';

@Entity('notification_recipients')
export class NotificationRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column({ default: false })
  delivered: boolean;

  @ManyToOne(() => Notification, (notification) => notification.recipients, {
    onDelete: 'CASCADE',
  })
  notification: Notification;

  @CreateDateColumn()
  createdAt: Date;
}
