import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';

describe('EventService', () => {
  let service: EventService;
  let repository: jest.Mocked<Repository<Event>>;

  const mockEvent: Event = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Evento Teste',
    description: 'Descrição',
    datetime: new Date('2025-12-25T10:00:00'),
    isActive: true,
    createdBy: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00'),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get(getRepositoryToken(Event));

    jest.clearAllMocks();
  });

  // ---------------------------
  // CREATE
  // ---------------------------
  describe('create', () => {
    it('deve criar um evento com sucesso', async () => {
      const createData : Event = {
        title: 'Novo Evento',
        datetime: new Date('2025-12-25T10:00:00'),
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
        id: '',
        createdAt: new Date('2025-12-25T10:00:00'),
        updatedAt: new Date('2025-12-25T10:00:00'),
        isActive: false
      };

      repository.create.mockReturnValue(mockEvent);
      repository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createData);

      expect(repository.create).toHaveBeenCalledWith({
        ...createData,
        datetime: new Date(createData.datetime),
      });
      expect(repository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('deve criar evento sem datetime', async () => {
      const createData = {
        title: 'Evento sem data',
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      repository.create.mockReturnValue(mockEvent);
      repository.save.mockResolvedValue(mockEvent);

      await service.create(createData);

      expect(repository.create).toHaveBeenCalledWith(createData);
    });
  });

  // ---------------------------
  // FIND ALL
  // ---------------------------
  describe('findAll', () => {
    it('deve retornar todos os eventos ativos ordenados por data', async () => {
      const events = [mockEvent];
      repository.find.mockResolvedValue(events);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { datetime: 'ASC' },
      });
      expect(result).toEqual(events);
    });

    it('deve retornar array vazio se não houver eventos', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ---------------------------
  // FIND ONE
  // ---------------------------
  describe('findOne', () => {
    it('deve retornar um evento por ID', async () => {
      repository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne('550e8400-e29b-41d4-a716-446655440000');

      expect(repository.findOne).toHaveBeenCalledWith({ 
        where: { id: '550e8400-e29b-41d4-a716-446655440000' } 
      });
      expect(result).toEqual(mockEvent);
    });

    it('deve lançar NotFoundException se evento não existir', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `Evento com id ${nonExistentId} não encontrado`
      );
    });
  });

  // ---------------------------
  // UPDATE
  // ---------------------------
  describe('update', () => {
    it('deve atualizar um evento existente', async () => {
      const updateData = { title: 'Título Atualizado' };
      const updatedEvent = { ...mockEvent, ...updateData };

      repository.findOne.mockResolvedValue(mockEvent);
      repository.save.mockResolvedValue(updatedEvent);

      const result = await service.update('550e8400-e29b-41d4-a716-446655440000', updateData);

      expect(repository.findOne).toHaveBeenCalledWith({ 
        where: { id: '550e8400-e29b-41d4-a716-446655440000' } 
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Título Atualizado');
    });

    it('deve lançar NotFoundException ao atualizar evento inexistente', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(nonExistentId, { title: 'Teste' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------
  // REMOVE
  // ---------------------------
  describe('remove', () => {
    it('deve remover um evento existente', async () => {
      repository.findOne.mockResolvedValue(mockEvent);
      repository.remove.mockResolvedValue(mockEvent);

      const result = await service.remove('550e8400-e29b-41d4-a716-446655440000');

      expect(repository.findOne).toHaveBeenCalledWith({ 
        where: { id: '550e8400-e29b-41d4-a716-446655440000' } 
      });
      expect(repository.remove).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual({ message: 'Evento removido com sucesso' });
    });

    it('deve lançar NotFoundException ao remover evento inexistente', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------
  // GET METRICS
  // ---------------------------
  describe('getMetrics', () => {
    it('deve retornar métricas do usuário', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const now = new Date();
      const currentYear = now.getFullYear();

      repository.count
        .mockResolvedValueOnce(10) // yearCreatedCount
        .mockResolvedValueOnce(5); // futureEventsCount

      repository.findOne
        .mockResolvedValueOnce(mockEvent) // nextEvent
        .mockResolvedValueOnce(mockEvent); // lastCreatedEvent

      const result = await service.getMetrics(userId);

      expect(result).toEqual({
        yearCreatedCount: 10,
        nextEvent: mockEvent,
        futureEventsCount: 5,
        lastCreatedEvent: mockEvent,
      });

      // Verifica chamadas do count
      expect(repository.count).toHaveBeenCalledTimes(2);
      
      // Verifica chamadas do findOne
      expect(repository.findOne).toHaveBeenCalledTimes(2);
    });

    it('deve retornar métricas com valores zerados se usuário não tiver eventos', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440002';
      repository.count.mockResolvedValue(0);
      repository.findOne.mockResolvedValue(null);

      const result = await service.getMetrics(userId);

      expect(result.yearCreatedCount).toBe(0);
      expect(result.futureEventsCount).toBe(0);
      expect(result.nextEvent).toBeNull();
      expect(result.lastCreatedEvent).toBeNull();
    });
  });

  // ---------------------------
  // FIND ALL PAGINATED
  // ---------------------------
  describe('findAllPaginated', () => {
    it('deve retornar eventos paginados', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockEvent], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllPaginated(
        '550e8400-e29b-41d4-a716-446655440001',
        1,
        20
      );

      expect(result).toEqual({
        data: [mockEvent],
        total: 1,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"event"."createdBy" = :userId',
        { userId: '550e8400-e29b-41d4-a716-446655440001' }
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('deve usar valores padrão de paginação', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAllPaginated('550e8400-e29b-41d4-a716-446655440001');

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  // ---------------------------
  // FIND ALL BY MONTH
  // ---------------------------
  describe('findAllByMonth', () => {
    it('deve retornar eventos de um mês específico', async () => {
      const events = [mockEvent];
      repository.find.mockResolvedValue(events);

      const result = await service.findAllByMonth(12, 2025, '550e8400-e29b-41d4-a716-446655440001');

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
          isActive: true,
          datetime: Between(
            new Date(2025, 11, 1, 0, 0, 0),
            new Date(2025, 12, 1, 0, 0, 0)
          ),
        },
        order: { datetime: 'ASC' },
      });
      expect(result).toEqual(events);
    });

    it('deve retornar array vazio se não houver eventos no mês', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAllByMonth(6, 2025, '550e8400-e29b-41d4-a716-446655440001');

      expect(result).toEqual([]);
    });
  });

  // ---------------------------
  // FIND ALL BY MONTH GROUPED BY DAY
  // ---------------------------
  describe('findAllByMonthGroupedByDay', () => {
    it('deve retornar eventos agrupados por dia', async () => {
      const event1 = {
        ...mockEvent,
        id: '550e8400-e29b-41d4-a716-446655440001',
        datetime: new Date('2025-12-25T10:00:00'),
      };
      const event2 = {
        ...mockEvent,
        id: '550e8400-e29b-41d4-a716-446655440002',
        datetime: new Date('2025-12-25T15:00:00'),
      };
      const event3 = {
        ...mockEvent,
        id: '550e8400-e29b-41d4-a716-446655440003',
        datetime: new Date('2025-12-26T10:00:00'),
      };

      repository.find.mockResolvedValue([event1, event2, event3]);

      const result = await service.findAllByMonthGroupedByDay(
        12,
        2025,
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result).toEqual({
        '25': [event1, event2],
        '26': [event3],
      });
    });

    it('deve retornar objeto vazio se não houver eventos', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAllByMonthGroupedByDay(
        12,
        2025,
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result).toEqual({});
    });
  });
});