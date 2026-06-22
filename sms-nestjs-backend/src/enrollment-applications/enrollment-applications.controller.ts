import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EnrollmentApplicationsService } from './enrollment-applications.service';
import { Roles } from '../auth/roles.decorator';

@Controller('enrollment-applications')
export class EnrollmentApplicationsController {
  constructor(
    private readonly enrollmentApplicationsService: EnrollmentApplicationsService,
  ) {}

  @Roles('REGISTRAR')
  @Post()
  create(@Body() createDto: any) {
    return this.enrollmentApplicationsService.create(createDto);
  }

  @Roles('REGISTRAR', 'PRINCIPAL')
  @Get()
  findAll(@Query('ayId') ayId?: string) {
    return this.enrollmentApplicationsService.findAll(ayId);
  }

  @Roles('REGISTRAR', 'PRINCIPAL')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentApplicationsService.findOne(id);
  }

  @Roles('REGISTRAR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.enrollmentApplicationsService.update(id, updateDto);
  }

  @Roles('REGISTRAR', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentApplicationsService.remove(id);
  }
}
