import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
/* istanbul ignore next */
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    // Create the pg.Pool explicitly so ssl options are guaranteed to be applied.
    // PrismaPg does not forward unknown PoolConfig fields — passing ssl to it directly
    // has no effect and the pool ignores certificate verification settings.
    const pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
    // @prisma/adapter-pg bundles its own @types/pg, causing a structural type mismatch
    // with the top-level pg.Pool. Both are the same class at runtime — cast is safe.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const adapter = new PrismaPg(pool as any);
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
