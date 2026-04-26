import { Injectable } from '@nestjs/common';
import { UserOutletStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { MyOutletResponse } from './dto/my-outlet.response';
import { OutletListItemResponse } from './dto/outlet-list-item.response';

const OUTLETS_PAGE_SIZE = 20;

export interface FindOutletsParams {
  userId: string;
  connected: boolean;
  q?: string;
  cursor?: string;
}

export interface FindOutletsResult {
  data: OutletListItemResponse[];
  meta: {
    nextCursor: string | null;
  };
}

@Injectable()
/* istanbul ignore next */
export class OutletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
    statuses: UserOutletStatus[] = [UserOutletStatus.CONFIRMED],
  ): Promise<MyOutletResponse[]> {
    const memberships = await this.prisma.userOutlet.findMany({
      where: {
        userId,
        status: { in: statuses },
      },
      include: { outlet: true },
    });

    return memberships.map((membership) => ({
      id: membership.outlet.id,
      name: membership.outlet.name,
      address: membership.outlet.address,
      role: membership.role,
    }));
  }

  async findOutlets(params: FindOutletsParams): Promise<FindOutletsResult> {
    const statuses = params.connected
      ? [UserOutletStatus.CONFIRMED]
      : [UserOutletStatus.PENDING, UserOutletStatus.REJECTED];

    const memberships = await this.prisma.userOutlet.findMany({
      where: {
        userId: params.userId,
        status: { in: statuses },
        outlet: params.q
          ? {
              name: {
                contains: params.q,
                mode: 'insensitive',
              },
            }
          : undefined,
      },
      include: { outlet: true },
      orderBy: { id: 'asc' },
      take: OUTLETS_PAGE_SIZE + 1,
      ...(params.cursor
        ? {
            cursor: { id: params.cursor },
            skip: 1,
          }
        : {}),
    });

    const pageItems = memberships.slice(0, OUTLETS_PAGE_SIZE);
    const nextCursor =
      memberships.length > OUTLETS_PAGE_SIZE ? pageItems[pageItems.length - 1].id : null;

    return {
      data: pageItems.map((membership) => ({
        id: membership.outlet.id,
        name: membership.outlet.name,
        address: membership.outlet.address,
        role: params.connected ? membership.role : null,
        ...(params.connected ? {} : { membershipStatus: membership.status }),
      })),
      meta: { nextCursor },
    };
  }

  findMembership(userId: string, outletId: string) {
    return this.prisma.userOutlet.findUnique({
      where: {
        userId_outletId: {
          userId,
          outletId,
        },
      },
    });
  }

  async updateMembershipStatus(
    userId: string,
    outletId: string,
    status: UserOutletStatus,
  ): Promise<UserOutletStatus> {
    const membership = await this.prisma.userOutlet.update({
      where: {
        userId_outletId: {
          userId,
          outletId,
        },
      },
      data: { status },
      select: { status: true },
    });

    return membership.status;
  }
}
