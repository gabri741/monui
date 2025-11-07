import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/notification.entity';
import { NotificationRecipientModule } from './notification-recipient/notification-recipient.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'user',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'notificationsdb',
      entities: [Notification],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    NotificationModule,
    NotificationRecipientModule,
  ],
})
export class AppModule {}
