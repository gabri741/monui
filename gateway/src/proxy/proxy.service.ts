import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forwardRequest(method: string, url: string, body: any, headers: any) {
    try {

      const response$ = this.httpService.request({
        method,
        url,
        data: body, 
        headers: {
          ...headers,
          host: undefined, 
          'content-length': undefined, 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      }).pipe(
        catchError((error) => {
          throw error;
        })
      );

      const response = await lastValueFrom(response$);
      return response.data;

    } catch (error) {
      console.error("🚨 ERRO NO PROXY");

      console.error("🔸 Mensagem:", error.message);
      console.error("🔸 Código:", error.code);
      console.error("🔸 Stack:", error.stack);

      if (error.response) {
        console.error("📥 RESPOSTA DO SERVIÇO:");
        console.error("🔹 Status:", error.response.status);
        console.error("🔹 StatusText:", error.response.statusText);
        console.error("🔹 Headers:", JSON.stringify(error.response.headers, null, 2));
        console.error("🔹 Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("❗ ERRO SEM RESPONSE (provável timeout / DNS / conexão)");
      }

      if (error.config) {
        console.error("📤 REQUEST ENVIADA:");
        console.error("🔹 URL:", error.config.url);
        console.error("🔹 Method:", error.config.method);
        console.error("🔹 Headers:", error.config.headers);
        console.error("🔹 Timeout:", error.config.timeout);
        console.error("🔹 Body:", error.config.data);
      }

      throw new HttpException(
        error.response?.data || "Erro no serviço de destino",
        error.response?.status || 500,
      );
    }
  }
}