import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() body: Partial<Event>): Promise<Event> {
    return await this.eventService.create(body);
  }

  @Get()
  async findAll(): Promise<Event[]> {
    return await this.eventService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return await this.eventService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Event>): Promise<Event> {
    return await this.eventService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.eventService.remove(id);
  }

  @Get('metrics/:userId')
  async getMetrics(@Param('userId') userId: string) {
    return this.eventService.getMetrics(userId);
  }
}
