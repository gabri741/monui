import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
}
