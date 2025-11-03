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
      console.error('❌ Erro ao encaminhar:', error.message);
      throw new HttpException(
        error.response?.data || 'Erro no serviço de destino',
        error.response?.status || 500,
      );
    }
  }
}