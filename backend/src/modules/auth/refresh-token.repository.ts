import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../shared/database/prisma.service';

const REFRESH_BCRYPT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 30;
const TOKEN_PREFIX_LENGTH = 8;

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenPrefix = rawToken.slice(0, TOKEN_PREFIX_LENGTH);
    const tokenHash = await bcrypt.hash(rawToken, REFRESH_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, tokenPrefix, expiresAt },
    });
    return rawToken;
  }

  async findAndDelete(rawToken: string) {
    const prefix = rawToken.slice(0, TOKEN_PREFIX_LENGTH);

    // Fast path: look up by prefix (covers all new tokens)
    const candidates = await this.prisma.refreshToken.findMany({
      where: { tokenPrefix: prefix, expiresAt: { gt: new Date() } },
    });

    for (const token of candidates) {
      if (await bcrypt.compare(rawToken, token.tokenHash)) {
        await this.prisma.refreshToken.delete({ where: { id: token.id } });
        return token;
      }
    }

    // Fallback: full scan for legacy rows that have empty tokenPrefix
    const legacy = await this.prisma.refreshToken.findMany({
      where: { tokenPrefix: '', expiresAt: { gt: new Date() } },
    });

    for (const token of legacy) {
      if (await bcrypt.compare(rawToken, token.tokenHash)) {
        await this.prisma.refreshToken.delete({ where: { id: token.id } });
        return token;
      }
    }

    return null;
  }

  async deleteExpiredByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.refreshToken.count({
      where: { userId, expiresAt: { gt: new Date() } },
    });
  }

  async deleteOldestByUserId(userId: string): Promise<void> {
    const oldest = await this.prisma.refreshToken.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'asc' },
    });
    if (oldest) {
      await this.prisma.refreshToken.delete({ where: { id: oldest.id } });
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
