import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationRecipient } from '../notification-recipient/notification-recipient.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column('timestamp', { array: true })
  triggerDates: Date[];

  @Column({ type: 'uuid', nullable: false })
  eventId: string;

  @OneToMany(
    () => NotificationRecipient,
    (recipient) => recipient.notification,
    { cascade: true, eager: true },
  )
  recipients: NotificationRecipient[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;
}