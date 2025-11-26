import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { ProxyService } from './proxy.service';

describe('ProxyService', () => {
  let service: ProxyService;
  let httpService: jest.Mocked<HttpService>;

  const mockAxiosResponse: AxiosResponse = {
    data: { success: true, message: 'Resposta mock' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const mockHttpService = {
      request: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    httpService = module.get(HttpService);

    jest.clearAllMocks();
  });

  // ---------------------------
  // FORWARD REQUEST - SUCESSO
  // ---------------------------
  describe('forwardRequest - Sucesso', () => {
    it('deve encaminhar uma requisição GET com sucesso', async () => {
      const url = 'https://api.example.com/users';
      const headers = { Authorization: 'Bearer token123' };

      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest('GET', url, null, headers);

      expect(result).toEqual(mockAxiosResponse.data);
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'GET',
        url,
        data: null,
        headers: {
          Authorization: 'Bearer token123',
          host: undefined,
          'content-length': undefined,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
    });

    it('deve encaminhar uma requisição POST com body', async () => {
      const url = 'https://api.example.com/users';
      const body = { name: 'João', email: 'joao@test.com' };
      const headers = { Authorization: 'Bearer token123' };

      const postResponse = {
        ...mockAxiosResponse,
        data: { id: '1', ...body },
      };

      httpService.request.mockReturnValue(of(postResponse));

      const result = await service.forwardRequest('POST', url, body, headers);

      expect(result).toEqual(postResponse.data);
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        url,
        data: body,
        headers: {
          Authorization: 'Bearer token123',
          host: undefined,
          'content-length': undefined,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
    });

    it('deve encaminhar uma requisição PUT', async () => {
      const url = 'https://api.example.com/users/1';
      const body = { name: 'João Atualizado' };
      const headers = {};

      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest('PUT', url, body, headers);

      expect(result).toEqual(mockAxiosResponse.data);
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url,
          data: body,
        })
      );
    });

    it('deve encaminhar uma requisição DELETE', async () => {
      const url = 'https://api.example.com/users/1';
      const headers = { Authorization: 'Bearer token123' };

      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest('DELETE', url, null, headers);

      expect(result).toEqual(mockAxiosResponse.data);
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url,
          data: null,
        })
      );
    });

    it('deve remover headers desnecessários (host, content-length)', async () => {
      const url = 'https://api.example.com/users';
      const headers = {
        Authorization: 'Bearer token123',
        host: 'localhost:3000',
        'content-length': '123',
        'custom-header': 'value',
      };

      httpService.request.mockReturnValue(of(mockAxiosResponse));

      await service.forwardRequest('GET', url, null, headers);

      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
            'custom-header': 'value',
            host: undefined,
            'content-length': undefined,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );
    });

    it('deve aplicar timeout de 10 segundos', async () => {
      const url = 'https://api.example.com/slow-endpoint';
      
      httpService.request.mockReturnValue(of(mockAxiosResponse));

      await service.forwardRequest('GET', url, null, {});

      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });
  });

  // ---------------------------
  // FORWARD REQUEST - ERROS
  // ---------------------------
  describe('forwardRequest - Erros', () => {
    it('deve lançar HttpException quando serviço retorna 404', async () => {
      const url = 'https://api.example.com/not-found';
      const axiosError = {
        response: {
          data: { message: 'Recurso não encontrado' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        message: 'Request failed with status code 404',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('GET', url, null, {})
      ).rejects.toThrow(HttpException);

      await expect(
        service.forwardRequest('GET', url, null, {})
      ).rejects.toThrow(
        new HttpException({ message: 'Recurso não encontrado' }, 404)
      );
    });

    it('deve lançar HttpException quando serviço retorna 500', async () => {
      const url = 'https://api.example.com/error';
      const axiosError = {
        response: {
          data: { error: 'Erro interno do servidor' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        message: 'Request failed with status code 500',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('POST', url, {}, {})
      ).rejects.toThrow(HttpException);

      await expect(
        service.forwardRequest('POST', url, {}, {})
      ).rejects.toThrow(
        new HttpException({ error: 'Erro interno do servidor' }, 500)
      );
    });

    it('deve lançar HttpException 500 quando erro não tem response', async () => {
      const url = 'https://api.example.com/timeout';
      const axiosError = {
        message: 'Network Error',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('GET', url, null, {})
      ).rejects.toThrow(HttpException);

      await expect(
        service.forwardRequest('GET', url, null, {})
      ).rejects.toThrow(
        new HttpException('Erro no serviço de destino', 500)
      );
    });

    it('deve lançar HttpException quando serviço retorna 401 Unauthorized', async () => {
      const url = 'https://api.example.com/protected';
      const axiosError = {
        response: {
          data: { message: 'Token inválido' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
        message: 'Request failed with status code 401',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('GET', url, null, { Authorization: 'Bearer invalid' })
      ).rejects.toThrow(
        new HttpException({ message: 'Token inválido' }, 401)
      );
    });

    it('deve lançar HttpException quando serviço retorna 400 Bad Request', async () => {
      const url = 'https://api.example.com/validate';
      const body = { email: 'invalid-email' };
      const axiosError = {
        response: {
          data: { 
            message: 'Dados inválidos',
            errors: ['Email deve ser válido']
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        message: 'Request failed with status code 400',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('POST', url, body, {})
      ).rejects.toThrow(
        new HttpException(
          { message: 'Dados inválidos', errors: ['Email deve ser válido'] },
          400
        )
      );
    });

    it('deve logar erro no console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const url = 'https://api.example.com/error';
      const axiosError = {
        message: 'Timeout excedido',
        isAxiosError: true,
      } as AxiosError;

      httpService.request.mockReturnValue(throwError(() => axiosError));

      await expect(
        service.forwardRequest('GET', url, null, {})
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Erro ao encaminhar:',
        'Timeout excedido'
      );

      consoleSpy.mockRestore();
    });
  });

  // ---------------------------
  // EDGE CASES
  // ---------------------------
  describe('forwardRequest - Edge Cases', () => {
    it('deve funcionar com headers vazios', async () => {
      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest(
        'GET',
        'https://api.example.com/test',
        null,
        {}
      );

      expect(result).toEqual(mockAxiosResponse.data);
    });

    it('deve funcionar com body vazio em POST', async () => {
      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest(
        'POST',
        'https://api.example.com/test',
        {},
        {}
      );

      expect(result).toEqual(mockAxiosResponse.data);
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        })
      );
    });

    it('deve funcionar com body null', async () => {
      httpService.request.mockReturnValue(of(mockAxiosResponse));

      const result = await service.forwardRequest(
        'GET',
        'https://api.example.com/test',
        null,
        {}
      );

      expect(result).toEqual(mockAxiosResponse.data);
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
        })
      );
    });

    it('deve retornar dados mesmo quando response.data é array', async () => {
      const arrayResponse = {
        ...mockAxiosResponse,
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      };

      httpService.request.mockReturnValue(of(arrayResponse));

      const result = await service.forwardRequest(
        'GET',
        'https://api.example.com/list',
        null,
        {}
      );

      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('deve retornar dados mesmo quando response.data é string', async () => {
      const stringResponse = {
        ...mockAxiosResponse,
        data: 'success',
      };

      httpService.request.mockReturnValue(of(stringResponse));

      const result = await service.forwardRequest(
        'GET',
        'https://api.example.com/status',
        null,
        {}
      );

      expect(result).toBe('success');
    });
  });
});