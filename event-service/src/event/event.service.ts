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
    if (!event) throw new NotFoundException(`Evento com id ${id} não encontrado`);
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
          new Date(`${currentYear}-12-31T23:59:59`)
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
        datetime: Between(
          now,
          new Date(`${currentYear}-12-31T23:59:59`)
        ),
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

}