import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { OutletsService } from './outlets.service';
import { MyOutletResponse } from './dto/my-outlet.response';

@ApiTags('outlets')
@Controller('outlets')
/* istanbul ignore next */
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all outlets the current user is a member of' })
  @ApiResponse({ status: 200, type: [MyOutletResponse] })
  getMyOutlets(@CurrentUser() user: User): Promise<MyOutletResponse[]> {
    return this.outletsService.getMyOutlets(user.id);
  }
}
