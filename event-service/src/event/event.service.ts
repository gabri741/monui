import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}