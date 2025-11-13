import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Notification } from '../notification/notification.entity';

@Entity('notification_recipients')
export class NotificationRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @ManyToOne(() => Notification, (notification) => notification.recipients, {
    onDelete: 'CASCADE',
  })
  notification: Notification;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @Column({ nullable: true })
  lastAttempt?: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'scheduled' | 'sent' | 'failed';
}
