import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { OtpRepository } from '../otp.repository';
import { PhoneConfigRepository } from '../phone-config.repository';
import { RefreshTokenRepository } from '../refresh-token.repository';

const mockUser = {
  id: 'user-1',
  phone: '+84901234567',
  name: 'Test User',
  password: '$2b$10$hashedpassword',
  role: Role.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtpRepository = {
  findByPhone: jest.fn(),
  deleteByPhone: jest.fn(),
  create: jest.fn(),
  incrementAttempts: jest.fn(),
  delete: jest.fn(),
};

const mockPhoneConfigRepository = {
  findByPhone: jest.fn(),
  upsert: jest.fn(),
};

const mockRefreshTokenRepository = {
  create: jest.fn(),
  findAndDelete: jest.fn(),
  deleteAllByUserId: jest.fn(),
};

const mockUsersService = {
  findByPhone: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: OtpRepository, useValue: mockOtpRepository },
        { provide: PhoneConfigRepository, useValue: mockPhoneConfigRepository },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('requestRegisterOtp', () => {
    it('sends OTP with purpose=register for new phone', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockPhoneConfigRepository.findByPhone.mockResolvedValue(null);
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestRegisterOtp('+84909999999');

      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84909999999',
        '999999',
        'register',
      );
    });

    it('throws ConflictException when phone already registered', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      await expect(service.requestRegisterOtp('+84901234567')).rejects.toThrow(
        ConflictException,
      );

      expect(mockOtpRepository.create).not.toHaveBeenCalled();
    });

    it('uses PhoneConfig.defaultOtp when configured', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockPhoneConfigRepository.findByPhone.mockResolvedValue({
        phone: '+84909999999',
        defaultOtp: '111111',
      });
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestRegisterOtp('+84909999999');

      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84909999999',
        '111111',
        'register',
      );
    });

    it('deletes previous OTP before creating a new one', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockPhoneConfigRepository.findByPhone.mockResolvedValue(null);
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestRegisterOtp('+84909999999');

      const deleteOrder =
        mockOtpRepository.deleteByPhone.mock.invocationCallOrder[0];
      const createOrder = mockOtpRepository.create.mock.invocationCallOrder[0];
      expect(deleteOrder).toBeLessThan(createOrder);
    });
  });

  describe('requestForgotPasswordOtp', () => {
    it('sends OTP with purpose=reset for existing user', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockPhoneConfigRepository.findByPhone.mockResolvedValue(null);
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestForgotPasswordOtp('+84901234567');

      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84901234567',
        '999999',
        'reset',
      );
    });

    it('throws NotFoundException when phone has no associated user', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);

      await expect(
        service.requestForgotPasswordOtp('+84909999999'),
      ).rejects.toThrow(NotFoundException);

      expect(mockOtpRepository.create).not.toHaveBeenCalled();
    });

    it('uses PhoneConfig.defaultOtp when configured', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockPhoneConfigRepository.findByPhone.mockResolvedValue({
        phone: '+84901234567',
        defaultOtp: '111111',
      });
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestForgotPasswordOtp('+84901234567');

      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84901234567',
        '111111',
        'reset',
      );
    });
  });

  describe('verifyOtp', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000);

    it('returns otpToken with purpose=register when OTP is correct', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'valid-hash',
        purpose: 'register',
        expiresAt: futureDate,
        attempts: 0,
      });
      mockJwtService.signAsync.mockResolvedValue('otp-token-jwt');
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      const result = await service.verifyOtp('+84901234567', '999999');

      expect(result).toEqual({ otpToken: 'otp-token-jwt' });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { phone: '+84901234567', purpose: 'register' },
        { expiresIn: '5m' },
      );
    });

    it('returns otpToken with purpose=reset for forgot-password flow', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'valid-hash',
        purpose: 'reset',
        expiresAt: futureDate,
        attempts: 0,
      });
      mockJwtService.signAsync.mockResolvedValue('otp-token-jwt');
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      const result = await service.verifyOtp('+84901234567', '999999');

      expect(result).toEqual({ otpToken: 'otp-token-jwt' });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { phone: '+84901234567', purpose: 'reset' },
        { expiresIn: '5m' },
      );
    });

    it('deletes OTP record on successful verification', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'valid-hash',
        purpose: 'register',
        expiresAt: futureDate,
        attempts: 0,
      });
      mockJwtService.signAsync.mockResolvedValue('otp-token-jwt');
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      await service.verifyOtp('+84901234567', '999999');

      expect(mockOtpRepository.delete).toHaveBeenCalledWith('otp-1');
    });

    it('throws UnauthorizedException when OTP not found', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue(null);

      await expect(service.verifyOtp('+84901234567', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when OTP is expired', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'hash',
        purpose: 'register',
        expiresAt: new Date(Date.now() - 1000),
        attempts: 0,
      });

      await expect(service.verifyOtp('+84901234567', '999999')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException and increments attempts on wrong OTP', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'hash',
        purpose: 'register',
        expiresAt: futureDate,
        attempts: 1,
      });
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(false);

      await expect(service.verifyOtp('+84901234567', '000000')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockOtpRepository.incrementAttempts).toHaveBeenCalledWith('otp-1');
    });

    it('blocks verification when attempts reach 3', async () => {
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'hash',
        purpose: 'register',
        expiresAt: futureDate,
        attempts: 3,
      });

      await expect(service.verifyOtp('+84901234567', '000000')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockOtpRepository.incrementAttempts).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('creates user with hashed password and returns tokens', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'register',
      });
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.register(
        'valid-otp-token',
        'Test User',
        'password123',
        'password123',
      );

      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+84901234567', name: 'Test User' }),
      );
      expect(mockPhoneConfigRepository.upsert).not.toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('passes hashed password to UsersService.create', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'register',
      });
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      await service.register(
        'valid-otp-token',
        'Test User',
        'password123',
        'password123',
      );

      const createCall = (
        mockUsersService.create.mock.calls as Array<[{ password: string }]>
      )[0][0];
      expect(createCall.password).toBeDefined();
      expect(createCall.password).not.toBe('password123');
      expect(createCall.password).toMatch(/^\$2[ab]\$/);
    });

    it('throws UnauthorizedException when otpToken is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.register('expired-token', 'Test User', 'pass', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when otpToken purpose is not register', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'reset',
      });

      await expect(
        service.register('reset-token', 'Test User', 'pass', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when passwords do not match', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'register',
      });

      await expect(
        service.register('valid-otp-token', 'Test User', 'pass1', 'pass2'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ConflictException when phone already registered', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'register',
      });
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      await expect(
        service.register('valid-otp-token', 'Test User', 'pass', 'pass'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid phone and matching password', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      const result = await service.login('+84901234567', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);

      await expect(
        service.login('+84909999999', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user has no password set', async () => {
      mockUsersService.findByPhone.mockResolvedValue({
        ...mockUser,
        password: null,
      });

      await expect(
        service.login('+84901234567', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(false);

      await expect(
        service.login('+84901234567', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('updates password and returns tokens', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'reset',
      });
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockUsersService.updatePassword.mockResolvedValue(undefined);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.resetPassword(
        'valid-otp-token',
        'newpass123',
        'newpass123',
      );

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        expect.stringMatching(/^\$2[ab]\$/),
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws UnauthorizedException when otpToken is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.resetPassword('expired-token', 'pass', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when otpToken purpose is not reset', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'register',
      });

      await expect(
        service.resetPassword('register-token', 'pass', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when passwords do not match', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'reset',
      });

      await expect(
        service.resetPassword('valid-otp-token', 'pass1', 'pass2'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        phone: '+84901234567',
        purpose: 'reset',
      });
      mockUsersService.findByPhone.mockResolvedValue(null);

      await expect(
        service.resetPassword('valid-otp-token', 'pass', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deletes refresh token and returns gracefully', async () => {
      mockRefreshTokenRepository.findAndDelete.mockResolvedValue({
        id: 'rt-1',
      });

      await service.logout('raw-refresh-token');

      expect(mockRefreshTokenRepository.findAndDelete).toHaveBeenCalledWith(
        'raw-refresh-token',
      );
    });

    it('returns gracefully when refresh token not found', async () => {
      mockRefreshTokenRepository.findAndDelete.mockResolvedValue(null);

      await expect(service.logout('unknown-token')).resolves.not.toThrow();
    });
  });
});
