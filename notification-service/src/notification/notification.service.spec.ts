import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { MessageService } from '../message/message.service';
import { NotificationRecipient } from '../notification-recipient/notification-recipient.entity';


describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: jest.Mocked<Repository<Notification>>;
  let recipientRepository: jest.Mocked<Repository<NotificationRecipient>>;
  let messageService: jest.Mocked<MessageService>;

  const mockNotification: Notification = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Lembrete de Evento',
    body: 'Seu evento começa em 1 hora!',
    triggerDates: [new Date('2025-12-25T10:00:00')],
    eventId: '550e8400-e29b-41d4-a716-446655440001',
    createdBy: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00'),
    recipients: [],
  };

  const mockRecipient: NotificationRecipient = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    phoneNumber: '+5511999999999',
    status: 'pending',
    retryCount: 0,
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00'),
    notification: mockNotification,
  };

  beforeEach(async () => {
    const mockNotificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockRecipientRepository = {
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockMessageService = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(NotificationRecipient),
          useValue: mockRecipientRepository,
        },
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    recipientRepository = module.get(getRepositoryToken(NotificationRecipient));
    messageService = module.get(MessageService);

    jest.clearAllMocks();
  });

  // ---------------------------
  // CREATE
  // ---------------------------
  describe('create', () => {
    it('deve criar uma notificação com sucesso', async () => {
      const createData = {
        title: 'Nova Notificação',
        body: 'Texto da notificação',
        triggerDates: [new Date('2025-12-25T10:00:00')],
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(createData);

      expect(notificationRepository.create).toHaveBeenCalledWith(createData);
      expect(notificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });

    it('deve criar notificação com múltiplas triggerDates', async () => {
      const createData = {
        title: 'Notificação Múltipla',
        body: 'Texto',
        triggerDates: [
          new Date('2025-12-25T10:00:00'),
          new Date('2025-12-25T11:00:00'),
          new Date('2025-12-25T12:00:00'),
        ],
        eventId: '550e8400-e29b-41d4-a716-446655440001',
      };

      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);

      await service.create(createData);

      expect(notificationRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  // ---------------------------
  // FIND ALL
  // ---------------------------
  describe('findAll', () => {
    it('deve retornar todas as notificações', async () => {
      const notifications = [mockNotification];
      notificationRepository.find.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(notificationRepository.find).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });

    it('deve retornar array vazio se não houver notificações', async () => {
      notificationRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ---------------------------
  // FIND BY ID
  // ---------------------------
  describe('findById', () => {
    it('deve retornar uma notificação por ID', async () => {
      notificationRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findById('550e8400-e29b-41d4-a716-446655440000');

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      expect(result).toEqual(mockNotification);
    });

    it('deve lançar NotFoundException se notificação não existir', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(nonExistentId)).rejects.toThrow(
        `Notification with ID ${nonExistentId} not found`
      );
    });
  });

  // ---------------------------
  // UPDATE
  // ---------------------------
  describe('update', () => {
    it('deve atualizar uma notificação existente', async () => {
      const updateData = { title: 'Título Atualizado' };
      const updatedNotification = { ...mockNotification, ...updateData };

      notificationRepository.findOne.mockResolvedValue(mockNotification);
      notificationRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.update('550e8400-e29b-41d4-a716-446655440000', updateData);

      expect(notificationRepository.findOne).toHaveBeenCalled();
      expect(notificationRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Título Atualizado');
    });

    it('deve lançar NotFoundException ao atualizar notificação inexistente', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(nonExistentId, { title: 'Teste' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------
  // REMOVE
  // ---------------------------
  describe('remove', () => {
    it('deve remover uma notificação existente', async () => {
      notificationRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('550e8400-e29b-41d4-a716-446655440000');

      expect(notificationRepository.delete).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('deve lançar NotFoundException ao remover notificação inexistente', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-999999999999';
      notificationRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(nonExistentId)).rejects.toThrow(
        `Notification with ID ${nonExistentId} not found`
      );
    });
  });

  // ---------------------------
  // PROCESS PENDING NOTIFICATIONS
  // ---------------------------
  describe('processPendingNotifications', () => {
    it('deve processar e enviar notificações pendentes com sucesso', async () => {
      const notificationWithRecipients = {
        ...mockNotification,
        recipients: [{ ...mockRecipient, status: 'pending' as const }],
      };

      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([notificationWithRecipients]);
      messageService.send.mockResolvedValue(undefined);
      recipientRepository.save.mockResolvedValue(mockRecipient);

      await service.processPendingNotifications();

      expect(messageService.send).toHaveBeenCalledWith(
        mockRecipient.phoneNumber,
        mockNotification.body,
      );
      expect(recipientRepository.save).toHaveBeenCalled();
    });

    it('não deve processar se não houver notificações pendentes', async () => {
      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([]);

      await service.processPendingNotifications();

      expect(messageService.send).not.toHaveBeenCalled();
    });

    it('deve pular destinatários que já foram enviados', async () => {
      const notificationWithSentRecipient = {
        ...mockNotification,
        recipients: [{ ...mockRecipient, status: 'sent' as const }],
      };

      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([notificationWithSentRecipient]);

      await service.processPendingNotifications();

      expect(messageService.send).not.toHaveBeenCalled();
    });

    it('deve marcar como maxtry quando atingir o limite de tentativas', async () => {
      const recipientWithMaxRetries = {
        ...mockRecipient,
        status: 'failed' as const,
        retryCount: 3,
      };

      const notificationWithMaxRetries = {
        ...mockNotification,
        recipients: [recipientWithMaxRetries],
      };

      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([notificationWithMaxRetries]);
      recipientRepository.save.mockResolvedValue(recipientWithMaxRetries);

      await service.processPendingNotifications();

      expect(recipientRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'maxtry',
        })
      );
      expect(messageService.send).not.toHaveBeenCalled();
    });

    it('deve marcar como failed e incrementar retryCount em caso de erro no envio', async () => {
      const notificationWithRecipients = {
        ...mockNotification,
        recipients: [{ ...mockRecipient, status: 'pending' as const }],
      };

      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([notificationWithRecipients]);
      messageService.send.mockRejectedValue(new Error('Erro ao enviar'));
      recipientRepository.save.mockResolvedValue(mockRecipient);

      await service.processPendingNotifications();

      expect(recipientRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          retryCount: 1,
        })
      );
    });

    it('deve processar múltiplos destinatários', async () => {
      const recipient1 = { ...mockRecipient, id: '550e8400-e29b-41d4-a716-446655440010', phoneNumber: '+5511111111111', status: 'pending' as const };
      const recipient2 = { ...mockRecipient, id: '550e8400-e29b-41d4-a716-446655440011', phoneNumber: '+5511222222222', status: 'pending' as const };

      const notificationWithMultipleRecipients = {
        ...mockNotification,
        recipients: [recipient1, recipient2],
      };

      jest.spyOn(service, 'findDueNotifications').mockResolvedValue([notificationWithMultipleRecipients]);
      messageService.send.mockResolvedValue(undefined);
      recipientRepository.save.mockResolvedValue(mockRecipient);

      await service.processPendingNotifications();

      expect(messageService.send).toHaveBeenCalledTimes(2);
      expect(recipientRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------
  // FIND DUE NOTIFICATIONS
  // ---------------------------
  describe('findDueNotifications', () => {
    it('deve buscar notificações com triggerDates vencidas', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockNotification]),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findDueNotifications(new Date('2025-12-25T11:00:00'));

      expect(notificationRepository.createQueryBuilder).toHaveBeenCalledWith('n');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('n.recipients', 'r');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([mockNotification]);
    });

    it('deve retornar array vazio se não houver notificações vencidas', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findDueNotifications(new Date('2025-12-20T10:00:00'));

      expect(result).toEqual([]);
    });
  });

  // ---------------------------
  // GET STATS BY USER
  // ---------------------------
  describe('getStatsByUser', () => {
    it('deve retornar estatísticas de 7 dias', async () => {
      const mockStats = [
        { date: '2025-01-20', sent: 10, failed: 2 },
        { date: '2025-01-21', sent: 15, failed: 1 },
      ];

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getStatsByUser('550e8400-e29b-41d4-a716-446655440002', '7d');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('n.createdBy = :userId', { 
        userId: '550e8400-e29b-41d4-a716-446655440002' 
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `n.createdAt >= NOW() - INTERVAL '7 days'`
      );
      expect(result).toEqual(mockStats);
    });

    it('deve retornar estatísticas de 30 dias', async () => {
      const mockStats = [
        { date: '2025-01-01', sent: 50, failed: 5 },
      ];

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getStatsByUser('550e8400-e29b-41d4-a716-446655440002', '30d');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `n.createdAt >= NOW() - INTERVAL '30 days'`
      );
      expect(result).toEqual(mockStats);
    });

    it('deve usar 90 dias como período padrão', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getStatsByUser('550e8400-e29b-41d4-a716-446655440002');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `n.createdAt >= NOW() - INTERVAL '90 days'`
      );
    });
  });

  // ---------------------------
  // FIND ALL BY USER PAGINATED
  // ---------------------------
  describe('findAllByUserPaginated', () => {
    it('deve retornar destinatários paginados', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockRecipient], 1]),
      };

      recipientRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllByUserPaginated(
        '550e8400-e29b-41d4-a716-446655440002',
        1,
        20
      );

      expect(result).toEqual({
        data: [mockRecipient],
        total: 1,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.createdBy = :userId',
        { userId: '550e8400-e29b-41d4-a716-446655440002' }
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('recipient.lastAttempt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('deve usar valores padrão de paginação', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      recipientRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAllByUserPaginated('550e8400-e29b-41d4-a716-446655440002');

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('deve paginar corretamente na página 2', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      recipientRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAllByUserPaginated('550e8400-e29b-41d4-a716-446655440002', 2, 10);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  // ---------------------------
  // SEND WHATSAPP NOTIFICATION
  // ---------------------------
  describe('sendWhatsAppNotification', () => {
    it('deve chamar o MessageService para enviar mensagem', async () => {
      messageService.send.mockResolvedValue(undefined);

      await service.sendWhatsAppNotification('+5511999999999', 'Mensagem de teste');

      expect(messageService.send).toHaveBeenCalledWith('Mensagem de teste', '+5511999999999');
    });

    it('deve propagar erro do MessageService', async () => {
      messageService.send.mockRejectedValue(new Error('Falha no envio'));

      await expect(
        service.sendWhatsAppNotification('+5511999999999', 'Mensagem de teste')
      ).rejects.toThrow('Falha no envio');
    });
  });
});