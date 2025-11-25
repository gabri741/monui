import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { GetEventsCalendarQueryDto } from './dto/get-events-calendar.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}


   @Get('grouped')
  async findAllGrouped(@Query() query: GetEventsCalendarQueryDto) {
    return await this.eventService.findAllByMonthGroupedByDay(
      query.month,
      query.year,
      query.userId,
    );
  }

  @Get('paginated')
  async findPaginated(
    @Query('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;

    return this.eventService.findAllPaginated(userId, pageNumber, limitNumber);
  }

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
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Event>,
  ): Promise<Event> {
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


