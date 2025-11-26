import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, HttpException } from '@nestjs/common';

// ---------------------------
// MOCK AXIOS — SEM VARIÁVEIS EXTERNAS
// ---------------------------
const axiosPostMock = jest.fn();
const axiosGetMock = jest.fn();

jest.mock('axios', () => ({
  post: (...args) => axiosPostMock(...args),
  get: (...args) => axiosGetMock(...args),
}));

// ---------------------------
// MOCK GOOGLE CLIENT
// ---------------------------
const verifyIdTokenMock = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: (...args) => verifyIdTokenMock(...args),
  })),
}));

// ---------------------------

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed-token'),
            verifyAsync: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  // -------------------------------------
  // REGISTER
  // -------------------------------------
  it('deve registrar um usuário', async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: { id: 1, email: 'a@a.com' },
    });

    const result = await service.register({
      email: 'a@a.com',
      password: '123',
      firstName: 'A',
      lastName: 'B',
      birthDate: new Date('2000-01-01'),
    });

    expect(result.access_token).toBeDefined();
    expect(result.user.email).toBe('a@a.com');
  });

  // -------------------------------------
  // LOGIN
  // -------------------------------------
  it('deve logar um usuário', async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: { id: 1, email: 'a@a.com' },
    });

    const res = await service.login({
      email: 'a@a.com',
      password: '123',
    });

    expect(res.access_token).toBeDefined();
    expect(res.user.email).toBe('a@a.com');
  });

  it('deve lançar erro no login inválido', async () => {
    axiosPostMock.mockRejectedValueOnce(new Error('invalid'));

    await expect(
      service.login({ email: 'a@a.com', password: 'errado' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // -------------------------------------
  // VALIDAR TOKEN
  // -------------------------------------
  it('deve validar token', async () => {
    const res = await service.validateToken('abc');
    expect(res.ok).toBe(true);
  });

  it('token inválido deve lançar erro', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error());

    await expect(service.validateToken('abc')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // -------------------------------------
  // GOOGLE LOGIN
  // -------------------------------------
  it('deve logar com Google', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        email: 'a@a.com',
        name: 'User',
        picture: 'avatar.jpg',
        sub: 'google123',
      }),
    });

    axiosGetMock.mockResolvedValueOnce({ data: null }); // não existe
    axiosPostMock.mockResolvedValueOnce({
      data: { id: 1, email: 'a@a.com' },
    });

    const result = await service.loginWithGoogle('token123');

    expect(result.access_token).toBeDefined();
    expect(result.user.email).toBe('a@a.com');
  });
});
