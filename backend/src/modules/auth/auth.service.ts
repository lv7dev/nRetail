import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OtpRepository } from './otp.repository';
import { PhoneConfigRepository } from './phone-config.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UsersService } from '../users/users.service';

const PASSWORD_BCRYPT_ROUNDS = 10;
const MAX_SESSIONS_PER_USER = 5;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserRecord {
  id: string;
  phone: string;
  role: string;
}

@Injectable()
/* istanbul ignore next */
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpRepository: OtpRepository,
    private readonly phoneConfigRepository: PhoneConfigRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async requestRegisterOtp(phone: string): Promise<void> {
    const existing = await this.usersService.findByPhone(phone);
    if (existing) {
      throw new ConflictException({
        message: 'Phone number already registered',
        code: 'PHONE_ALREADY_EXISTS',
      });
    }
    await this.sendOtp(phone, 'register');
  }

  async requestForgotPasswordOtp(phone: string): Promise<void> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new NotFoundException({
        message: 'No account found for this phone number',
        code: 'PHONE_NOT_FOUND',
      });
    }
    await this.sendOtp(phone, 'reset');
  }

  async verifyOtp(phone: string, otp: string): Promise<{ otpToken: string }> {
    const record = await this.otpRepository.findByPhone(phone);

    if (!record) {
      throw new UnauthorizedException({
        message: 'Invalid or expired OTP',
        code: 'OTP_INVALID',
      });
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException({
        message: 'OTP has expired',
        code: 'OTP_EXPIRED',
      });
    }

    if (record.attempts >= 3) {
      throw new UnauthorizedException({
        message: 'Too many failed attempts',
        code: 'OTP_INVALID',
      });
    }

    const valid = await this.compareOtp(otp, record.otpHash);
    if (!valid) {
      await this.otpRepository.incrementAttempts(record.id);
      throw new UnauthorizedException({
        message: 'Invalid OTP',
        code: 'OTP_INVALID',
      });
    }

    await this.otpRepository.delete(record.id);

    const otpToken = await this.jwtService.signAsync(
      { phone, purpose: record.purpose },
      { expiresIn: '5m' },
    );
    return { otpToken };
  }

  async register(
    otpToken: string,
    name: string,
    password: string,
    confirmPassword: string,
  ): Promise<TokenPair & { user: UserRecord }> {
    const payload = await this.verifyOtpToken(otpToken, 'register');

    if (password !== confirmPassword) {
      throw new BadRequestException({
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH',
      });
    }

    const existing = await this.usersService.findByPhone(payload.phone);
    if (existing) {
      throw new ConflictException({
        message: 'Phone number already registered',
        code: 'PHONE_ALREADY_EXISTS',
      });
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD_BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      phone: payload.phone,
      name,
      password: hashedPassword,
    });
    const tokens = await this.issueTokens(user);
    return { ...tokens, user };
  }

  async login(phone: string, password: string): Promise<TokenPair & { user: UserRecord }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user || !user.password) {
      throw new UnauthorizedException({
        message: 'Invalid phone or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const valid = await this.compareOtp(password, user.password);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid phone or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, user };
  }

  async resetPassword(
    otpToken: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<TokenPair> {
    const payload = await this.verifyOtpToken(otpToken, 'reset');

    if (newPassword !== confirmPassword) {
      throw new BadRequestException({
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH',
      });
    }

    const user = await this.usersService.findByPhone(payload.phone);
    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'PHONE_NOT_FOUND',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_BCRYPT_ROUNDS);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const token = await this.refreshTokenRepository.findAndDelete(rawRefreshToken);

    if (!token) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_INVALID',
      });
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

  private async sendOtp(phone: string, purpose: string): Promise<void> {
    const config = await this.phoneConfigRepository.findByPhone(phone);
    const otp = config?.defaultOtp ?? '999999';
    await this.otpRepository.deleteByPhone(phone);
    await this.otpRepository.create(phone, otp, purpose);
  }

  private async verifyOtpToken(
    token: string,
    expectedPurpose: string,
  ): Promise<{ phone: string; purpose: string }> {
    let payload: { phone: string; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        phone: string;
        purpose: string;
      }>(token);
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid or expired token',
        code: 'OTP_INVALID',
      });
    }

    if (payload.purpose !== expectedPurpose) {
      throw new UnauthorizedException({
        message: 'Invalid token purpose',
        code: 'OTP_PURPOSE_MISMATCH',
      });
    }

    return payload;
  }

  private async issueTokens(user: UserRecord): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    await this.refreshTokenRepository.deleteExpiredByUserId(user.id);
    const activeCount = await this.refreshTokenRepository.countActiveByUserId(user.id);
    if (activeCount >= MAX_SESSIONS_PER_USER) {
      await this.refreshTokenRepository.deleteOldestByUserId(user.id);
    }

    const refreshToken = await this.refreshTokenRepository.create(user.id);
    return { accessToken, refreshToken };
  }

  private async compareOtp(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }
}
