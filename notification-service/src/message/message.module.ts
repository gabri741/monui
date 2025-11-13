// src/message/message.module.ts
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { UltraMsgProvider } from './providers/ultramsg.provider';

@Module({
  providers: [
    MessageService,
    {
      provide: 'MESSAGE_PROVIDER',
      useClass: UltraMsgProvider,
    },
  ],
  exports: [MessageService], 
})
export class MessageModule {}