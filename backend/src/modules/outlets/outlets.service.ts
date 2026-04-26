import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UserOutletStatus } from '@prisma/client';
import { OutletsRepository } from './outlets.repository';
import { MyOutletResponse } from './dto/my-outlet.response';
import { OutletListItemResponse } from './dto/outlet-list-item.response';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
/* istanbul ignore next */
export class OutletsService {
  constructor(private readonly outletsRepository: OutletsRepository) {}

  getMyOutlets(userId: string): Promise<MyOutletResponse[]> {
    return this.outletsRepository.findByUserId(userId, [UserOutletStatus.CONFIRMED]);
  }

  getOutlets(params: {
    userId: string;
    connected: boolean;
    q?: string;
    cursor?: string;
  }): Promise<{ data: OutletListItemResponse[]; meta: { nextCursor: string | null } }> {
    return this.outletsRepository.findOutlets(params);
  }

  async updateMembership(
    userId: string,
    outletId: string,
    action: UpdateMembershipDto['action'],
  ): Promise<{ status: UserOutletStatus }> {
    const membership = await this.outletsRepository.findMembership(userId, outletId);

    if (!membership) {
      throw new NotFoundException({
        message: 'Membership not found',
        code: 'OUTLET_MEMBERSHIP_NOT_FOUND',
      });
    }

    if (action === 'reject' && membership.status === UserOutletStatus.CONFIRMED) {
      throw new UnprocessableEntityException({
        message: 'Confirmed memberships cannot be rejected',
        code: 'OUTLET_MEMBERSHIP_REJECT_NOT_ALLOWED',
      });
    }

    const nextStatus =
      action === 'confirm' ? UserOutletStatus.CONFIRMED : UserOutletStatus.REJECTED;
    const status = await this.outletsRepository.updateMembershipStatus(
      userId,
      outletId,
      nextStatus,
    );

    return { status };
  }
}
