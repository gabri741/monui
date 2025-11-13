// src/message/message.service.ts
import { Inject, Injectable } from '@nestjs/common';
import type { MessageProvider } from './providers/message-provider.interface';

@Injectable()
export class MessageService {
    
  constructor( @Inject("MESSAGE_PROVIDER") private readonly provider: MessageProvider) {}

  async send(to: string, message: string): Promise<void> {
    await this.provider.sendMessage(to, message);
  }
}