// src/message/providers/ultramsg.provider.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { MessageProvider } from './message-provider.interface';

@Injectable()
export class UltraMsgProvider implements MessageProvider {
  private readonly logger = new Logger(UltraMsgProvider.name);
  private readonly baseUrl: string;
  private readonly token;
  private readonly instanceId;

  constructor() {
    this.instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    this.token = process.env.ULTRAMSG_TOKEN;
    this.baseUrl = `https://api.ultramsg.com/${this.instanceId}/messages/chat?token=${this.token}`;
  }

 async sendMessage(to: string, message: string): Promise<void> {
  this.logger.log(`Iniciando envio de mensagem para ${to}`);
  try {
    // ✅ Corrige: número sem + e adiciona o sufixo @c.us
    const formattedTo = to.replace('+', '') + '@c.us';

    const data = {
      to: formattedTo,
      body: message, // ✅ mensagem vai aqui
      token: this.token,
    };

    this.logger.debug(`Payload enviado: ${JSON.stringify(data, null, 2)}`);

    const response = await axios.post(this.baseUrl, data);

    this.logger.debug(
      `Resposta da API UltraMsg: ${response.status} ${response.statusText}`,
    );
    this.logger.debug(`Dados retornados: ${JSON.stringify(response.data, null, 2)}`);

    if (response.data?.error) {
      throw new Error(
        `Erro do UltraMsg: ${JSON.stringify(response.data.error, null, 2)}`,
      );
    }

    this.logger.log(`✅ Mensagem enviada com sucesso para ${to}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      this.logger.error(
        `❌ Falha ao enviar mensagem para ${to}. Status: ${error.response?.status}`,
      );
      this.logger.error(
        `Detalhes: ${JSON.stringify(error.response?.data, null, 2)}`,
      );
    } else {
      this.logger.error(`❌ Erro inesperado: ${error.message}`);
    }
    throw error;
  }
}
}
