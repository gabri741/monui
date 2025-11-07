import { All, Body, Controller, Headers, Req, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import type { Request, Response } from 'express';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async handleAll(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const baseMap = {
      '/users': process.env.USER_SERVICE_URL || 'http://localhost:3001',
      '/events': process.env.EVENT_SERVICE_URL || 'http://localhost:3002',
      '/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'
    };

    const baseUrl = Object.keys(baseMap).find((prefix) =>
      req.url.startsWith(prefix),
    );

    if (!baseUrl) {
      res.status(404).json({ message: 'Serviço não encontrado' });
      return;
    }

    const targetUrl = baseMap[baseUrl] + req.url;

    try {
      
      const data = await this.proxyService.forwardRequest(
        req.method,
        targetUrl,
        body,
        headers,
      );

      res.json(data);
    } catch (err) {
      const status =
        typeof err.getStatus === 'function'
          ? err.getStatus()
          : err.response?.status || err.status || 500;

      const message =
        err.response?.data?.message ||
        err.message ||
        'Erro desconhecido no gateway';

      res.status(status).json({ message });
    }
  }
}