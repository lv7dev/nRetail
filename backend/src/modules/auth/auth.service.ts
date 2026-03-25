import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OtpRepository } from './otp.repository';
import { PhoneConfigRepository } from './phone-config.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UsersService } from '../users/users.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserRecord {
  id: string;
  phone: string;
  role: string;
}

export interface VerifyOtpResult {
  accessToken?: string;
  refreshToken?: string;
  user?: UserRecord;
  registrationToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpRepository: OtpRepository,
    private readonly phoneConfigRepository: PhoneConfigRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(phone: string): Promise<void> {
    const config = await this.phoneConfigRepository.findByPhone(phone);
    const otp = config ? config.defaultOtp : this.generateOtp();

    await this.otpRepository.deleteByPhone(phone);
    await this.otpRepository.create(phone, otp);
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
    const record = await this.otpRepository.findByPhone(phone);

    if (!record) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (record.attempts >= 3) {
      throw new UnauthorizedException('Too many failed attempts');
    }

    const valid = await this.compareOtp(otp, record.otpHash);
    if (!valid) {
      await this.otpRepository.incrementAttempts(record.id);
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpRepository.delete(record.id);

    const user = await this.usersService.findByPhone(phone);
    if (user) {
      const tokens = await this.issueTokens(user);
      return { ...tokens, user };
    }

    const registrationToken = await this.jwtService.signAsync(
      { phone },
      { expiresIn: '5m' },
    );
    return { registrationToken };
  }

  async register(
    registrationToken: string,
    name: string,
  ): Promise<TokenPair & { user: UserRecord }> {
    let phone: string;
    try {
      const payload = await this.jwtService.verifyAsync<{ phone: string }>(
        registrationToken,
      );
      phone = payload.phone;
    } catch {
      throw new UnauthorizedException('Invalid or expired registration token');
    }

    const existing = await this.usersService.findByPhone(phone);
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const user = await this.usersService.create({ phone, name });
    await this.phoneConfigRepository.upsert(phone);
    const tokens = await this.issueTokens(user);

    return { ...tokens, user };
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const token =
      await this.refreshTokenRepository.findAndDelete(rawRefreshToken);

    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(token.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await this.refreshTokenRepository.findAndDelete(rawRefreshToken);
  }

  private async issueTokens(user: UserRecord): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });
    const refreshToken = await this.refreshTokenRepository.create(user.id);
    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async compareOtp(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }
}
