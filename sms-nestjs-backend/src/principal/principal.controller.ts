import { Controller, Get, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PrincipalService } from './principal.service';

interface AuthenticatedRequest {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

@Controller('principal')
@Roles('PRINCIPAL', 'ADMIN')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  @Get('overview')
  getOverview(@Query('academicYearId') academicYearId: string, @Req() req: AuthenticatedRequest) {
    return this.principalService.getOverview(academicYearId, req.user);
  }
}
