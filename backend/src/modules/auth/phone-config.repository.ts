import { Injectable } from '@nestjs/common';
import { PhoneConfig } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class PhoneConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<PhoneConfig | null> {
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
