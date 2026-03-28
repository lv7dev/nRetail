import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
/* istanbul ignore next */
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<{ db: string; error?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { db: 'ok' };
    } catch (err) {
      return { db: 'error', error: err instanceof Error ? err.message : String(err) };
    }
  }
}
