import { Body, Controller, Get, Param, ParseBoolPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { OutletsService } from './outlets.service';
import { MyOutletResponse } from './dto/my-outlet.response';
import { OutletListItemResponse } from './dto/outlet-list-item.response';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@ApiTags('outlets')
@Controller('outlets')
/* istanbul ignore next */
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get outlet memberships filtered by connection status' })
  @ApiQuery({ name: 'connected', type: Boolean, required: true })
  @ApiQuery({ name: 'q', type: String, required: false })
  @ApiQuery({ name: 'cursor', type: String, required: false })
  @ApiResponse({ status: 200, type: [OutletListItemResponse] })
  getOutlets(
    @CurrentUser() user: User,
    @Query('connected', ParseBoolPipe) connected: boolean,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
  ): Promise<{ data: OutletListItemResponse[]; meta: { nextCursor: string | null } }> {
    return this.outletsService.getOutlets({ userId: user.id, connected, q, cursor });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all outlets the current user is a member of' })
  @ApiResponse({ status: 200, type: [MyOutletResponse] })
  getMyOutlets(@CurrentUser() user: User): Promise<MyOutletResponse[]> {
    return this.outletsService.getMyOutlets(user.id);
  }

  @Patch(':outletId/membership')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm or reject an outlet membership' })
  @ApiParam({ name: 'outletId', type: String })
  @ApiResponse({ status: 200, schema: { example: { status: 'CONFIRMED' } } })
  updateMembership(
    @CurrentUser() user: User,
    @Param('outletId') outletId: string,
    @Body() body: UpdateMembershipDto,
  ): Promise<{ status: 'PENDING' | 'CONFIRMED' | 'REJECTED' }> {
    return this.outletsService.updateMembership(user.id, outletId, body.action);
  }
}
