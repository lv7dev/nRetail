import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../shared/database/prisma.service';

const REFRESH_BCRYPT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, REFRESH_BCRYPT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    return rawToken;
  }

  async findAndDelete(rawToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    for (const token of tokens) {
      const matches = await bcrypt.compare(rawToken, token.tokenHash);
      if (matches) {
        await this.prisma.refreshToken.delete({ where: { id: token.id } });
        return token;
      }
    }
    return null;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
