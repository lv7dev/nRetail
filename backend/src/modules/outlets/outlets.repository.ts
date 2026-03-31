import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { MyOutletResponse } from './dto/my-outlet.response';

@Injectable()
/* istanbul ignore next */
export class OutletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<MyOutletResponse[]> {
    const memberships = await this.prisma.userOutlet.findMany({
      where: { userId },
      include: { outlet: true },
    });

    return memberships.map((membership) => ({
      id: membership.outlet.id,
      name: membership.outlet.name,
      address: membership.outlet.address,
      role: membership.role,
    }));
  }
}
