import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { Roles } from '../auth/roles.decorator';

@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly service: CalendarEventsService) {}

  @Post()
  @Roles('ADMIN', 'REGISTRAR')
  create(@Body() createDto: any) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query('ayId') ayId?: string) {
    return this.service.findAll(ayId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'REGISTRAR')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'REGISTRAR')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
