import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("recipients")
  async getRecipientsByUser(
    @Query('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;

    return this.notificationService.findAllByUserPaginated(userId, pageNumber, limitNumber);
  }

  @Post()
  create(@Body() data: Partial<Notification>) {
    return this.notificationService.create(data);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.notificationService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Notification>) {
    return this.notificationService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Get("stats/:userId")
  async getStats(
    @Query("period") period: '7d' | '30d' | '90d' = '90d',
    @Param('userId') id: string
  ) {
    const userId = id;
    const stats = await this.notificationService.getStatsByUser(userId, period);
    
    return stats.map((row) => ({
      date: row.date,
      sent: Number(row.sent),
      failed: Number(row.failed),
    }));
  }

   

}
