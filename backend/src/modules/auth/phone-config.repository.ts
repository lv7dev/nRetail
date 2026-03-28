import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
/* istanbul ignore next */
export class PhoneConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string) {
    return this.prisma.phoneConfig.findUnique({ where: { phone } });
  }

  async upsert(phone: string): Promise<void> {
    await this.prisma.phoneConfig.upsert({
      where: { phone },
      create: { phone },
      update: {},
    });
  }
}
