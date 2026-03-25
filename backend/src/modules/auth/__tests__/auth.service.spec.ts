import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
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

  describe('requestOtp', () => {
    it('uses defaultOtp from PhoneConfig when phone is whitelisted', async () => {
      mockPhoneConfigRepository.findByPhone.mockResolvedValue({
        phone: '+84901234567',
        defaultOtp: '999999',
      });
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestOtp('+84901234567');

      expect(mockOtpRepository.deleteByPhone).toHaveBeenCalledWith(
        '+84901234567',
      );
      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84901234567',
        '999999',
      );
    });

    it('generates a random 6-digit OTP for non-whitelisted phone', async () => {
      mockPhoneConfigRepository.findByPhone.mockResolvedValue(null);
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestOtp('+84909999999');

      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        '+84909999999',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('deletes previous OTP before creating a new one', async () => {
      mockPhoneConfigRepository.findByPhone.mockResolvedValue(null);
      mockOtpRepository.deleteByPhone.mockResolvedValue(undefined);
      mockOtpRepository.create.mockResolvedValue(undefined);

      await service.requestOtp('+84901234567');

      const deleteOrder =
        mockOtpRepository.deleteByPhone.mock.invocationCallOrder[0];
      const createOrder = mockOtpRepository.create.mock.invocationCallOrder[0];
      expect(deleteOrder).toBeLessThan(createOrder);
    });
  });

  describe('verifyOtp', () => {
    it('returns tokens for existing user when OTP is correct', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'valid-hash',
        expiresAt: futureDate,
        attempts: 0,
      });
      // Mock bcrypt compare — we'll use a pre-hashed value approach
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      // We need bcrypt.compare to return true — inject via spy
      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      const result = await service.verifyOtp('+84901234567', '999999');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).not.toHaveProperty('registrationToken');
    });

    it('returns registrationToken for new user when OTP is correct', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84999999999',
        otpHash: 'valid-hash',
        expiresAt: futureDate,
        attempts: 0,
      });
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('registration-token');

      jest.spyOn(service as any, 'compareOtp').mockResolvedValue(true);

      const result = await service.verifyOtp('+84999999999', '999999');

      expect(result).toHaveProperty('registrationToken');
      expect(result).not.toHaveProperty('accessToken');
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
        expiresAt: new Date(Date.now() - 1000),
        attempts: 0,
      });

      await expect(service.verifyOtp('+84901234567', '999999')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException and increments attempts on wrong OTP', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'hash',
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
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      mockOtpRepository.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: '+84901234567',
        otpHash: 'hash',
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
    it('creates user, adds to PhoneConfig, and returns tokens', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ phone: '+84901234567' });
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockPhoneConfigRepository.upsert.mockResolvedValue(undefined);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.register('valid-reg-token', 'Test User');

      expect(mockUsersService.create).toHaveBeenCalledWith({
        phone: '+84901234567',
        name: 'Test User',
      });
      expect(mockPhoneConfigRepository.upsert).toHaveBeenCalledWith(
        '+84901234567',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('throws ConflictException when phone already registered', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ phone: '+84901234567' });
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      await expect(
        service.register('valid-reg-token', 'Test User'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws UnauthorizedException when registrationToken is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.register('expired-token', 'Test User'),
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
