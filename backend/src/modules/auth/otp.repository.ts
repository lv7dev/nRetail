import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OtpVerification } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';

const OTP_BCRYPT_ROUNDS = 8;
const OTP_TTL_MINUTES = 5;

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<OtpVerification | null> {
    return this.prisma.otpVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
  }

  deleteByPhone(phone: string): Promise<void> {
    return this.prisma.otpVerification
      .deleteMany({ where: { phone } })
      .then(() => undefined);
  }

  async create(phone: string, otp: string): Promise<void> {
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await this.prisma.otpVerification.create({
      data: { phone, otpHash, expiresAt },
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.prisma.otpVerification.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.otpVerification.delete({ where: { id } });
  }
}
