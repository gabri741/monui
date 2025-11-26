import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/user/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from './dto/google-user.dto';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: any;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedpass',
    isActive: true,
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // --------------------------------------------------------------------------
  // findById
  // --------------------------------------------------------------------------
  describe('findById', () => {
    it('deve retornar usuário sem password', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
    });

    it('deve lançar erro se usuário não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  // --------------------------------------------------------------------------
  // findAll
  // --------------------------------------------------------------------------
  describe('findAll', () => {
    it('deve retornar todos os usuários sem senha', async () => {
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
        },
      ]);
    });
  });

  // --------------------------------------------------------------------------
  // create
  // --------------------------------------------------------------------------
  describe('create', () => {
    it('deve criar usuário com senha criptografada', async () => {
      repository.findOne.mockResolvedValue(null); // não existe
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');

      repository.create.mockReturnValue({
        ...mockUser,
        password: 'hashed_pass',
      });

      repository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashed_pass',
      });

      const result = await service.create({
        email: 'test@example.com',
        password: '123456',
      });

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.password).toBeUndefined();
    });

    it('deve lançar erro se e-mail já existe', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({ email: 'test@example.com', password: '123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------------------
  // validateUser
  // --------------------------------------------------------------------------
  describe('validateUser', () => {
    it('deve validar e retornar usuário sem senha', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password',
      );

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
    });

    it('deve retornar null se usuário não existe', async () => {
      repository.findOne.mockResolvedValue(null);
      const result = await service.validateUser('x@x.com', '123');
      expect(result).toBeNull();
    });

    it('deve retornar null se senha incorreta', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', '123');
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // findByEmail
  // --------------------------------------------------------------------------
  describe('findByEmail', () => {
    it('deve retornar usuário por email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  // --------------------------------------------------------------------------
  // createGoogleUser
  // --------------------------------------------------------------------------
  describe('createGoogleUser', () => {
    it('deve criar usuário Google', async () => {
      const dto : GoogleUserDto = {
          email: 'google@example.com',
          name: 'Google User',
          googleId: 'ABC123',
          avatar: ''
      };

      repository.create.mockReturnValue({
        ...dto,
        firstName: dto.name,
        lastName: '',
        isActive: true,
      });

      repository.save.mockResolvedValue({
        ...dto,
        firstName: dto.name,
        lastName: '',
        isActive: true,
      });

      const result = await service.createGoogleUser(dto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('google@example.com');
    });
  });
});
