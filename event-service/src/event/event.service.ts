import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(data: Partial<Event>): Promise<Event> {
    const event = this.eventRepository.create({
      ...data,
      datetime: data.datetime ? new Date(data.datetime) : data.datetime,
    });
    return await this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { isActive: true },
      order: { datetime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event)
      throw new NotFoundException(`Evento com id ${id} não encontrado`);
    return event;
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, data);
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<{ message: string }> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
    return { message: 'Evento removido com sucesso' };
  }

  async getMetrics(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1️⃣ QTD de eventos criados no ano pelo usuário
    const yearCreatedCount = await this.eventRepository.count({
      where: {
        createdBy: userId,
        createdAt: Between(
          new Date(`${currentYear}-01-01T00:00:00`),
          new Date(`${currentYear}-12-31T23:59:59`),
        ),
      },
    });

    // 2️⃣ Próximo evento futuro do usuário
    const nextEvent = await this.eventRepository.findOne({
      where: {
        createdBy: userId,
        isActive: true,
        datetime: MoreThan(now),
      },
      order: { datetime: 'ASC' },
      select: ['title', 'datetime'],
    });

    // 3️⃣ QTD de eventos futuros até o fim do ano
    const futureEventsCount = await this.eventRepository.count({
      where: {
        createdBy: userId,
        isActive: true,
        datetime: Between(now, new Date(`${currentYear}-12-31T23:59:59`)),
      },
    });

    // 4️⃣ Último evento criado (baseado em createdAt)
    const lastCreatedEvent = await this.eventRepository.findOne({
      where: { createdBy: userId },
      order: { createdAt: 'DESC' },
      select: ['title', 'createdAt', 'datetime'],
    });

    return {
      yearCreatedCount,
      nextEvent,
      futureEventsCount,
      lastCreatedEvent,
    };
  }

  async findAllPaginated(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Event[]; total: number }> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('"event"."createdBy" = :userId', { userId })
      .orderBy('"event"."createdAt"', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findAllByMonth(
    month: number,
    year: number,
    userId: string,
  ): Promise<Event[]> {
    // Primeiro dia do mês
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    
    // Primeiro dia do mês seguinte
    const endDate = new Date(year, month, 1, 0, 0, 0);

    const events = await this.eventRepository.find({
      where: {
        createdBy: userId,
        isActive: true,
        datetime: Between(startDate, endDate),
      },
      order: {
        datetime: 'ASC',
      },
    });

    return events;
  }

   async findAllByMonthGroupedByDay(
    month: number,
    year: number,
    userId: string,
  ): Promise<Record<string, Event[]>> {
    const events = await this.findAllByMonth(month, year, userId);
    
    const grouped = events.reduce((acc, event) => {
      const day = new Date(event.datetime).getDate().toString();
      
      if (!acc[day]) {
        acc[day] = [];
      }
      
      acc[day].push(event);
      
      return acc;
    }, {} as Record<string, Event[]>);

    return grouped;
  }
}
