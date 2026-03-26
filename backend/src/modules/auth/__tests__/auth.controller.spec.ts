import { ThrottlerGuard } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

const mockUser = {
  id: 'user-1',
  phone: '+84901234567',
  name: 'Test User',
  role: Role.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

const mockAuthService = {
  requestRegisterOtp: jest.fn(),
  requestForgotPasswordOtp: jest.fn(),
  verifyOtp: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  resetPassword: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/otp/register', () => {
    it('calls requestRegisterOtp and returns void', async () => {
      mockAuthService.requestRegisterOtp.mockResolvedValue(undefined);

      await controller.requestRegisterOtp({ phone: '+84901234567' });

      expect(mockAuthService.requestRegisterOtp).toHaveBeenCalledWith(
        '+84901234567',
      );
    });
  });

  describe('POST /auth/otp/forgot-password', () => {
    it('calls requestForgotPasswordOtp and returns void', async () => {
      mockAuthService.requestForgotPasswordOtp.mockResolvedValue(undefined);

      await controller.requestForgotPasswordOtp({ phone: '+84901234567' });

      expect(mockAuthService.requestForgotPasswordOtp).toHaveBeenCalledWith(
        '+84901234567',
      );
    });
  });

  describe('POST /auth/otp/verify', () => {
    it('returns otpToken on successful OTP verification', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({ otpToken: 'otp-jwt' });

      const result = await controller.verifyOtp({
        phone: '+84901234567',
        otp: '999999',
      });

      expect(result).toEqual({ otpToken: 'otp-jwt' });
    });
  });

  describe('POST /auth/register', () => {
    it('returns tokens and user on successful registration', async () => {
      mockAuthService.register.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      const result = await controller.register({
        otpToken: 'otp-jwt',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'otp-jwt',
        'Test User',
        'password123',
        'password123',
      );
    });
  });

  describe('POST /auth/login', () => {
    it('returns tokens and user on successful login', async () => {
      mockAuthService.login.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      const result = await controller.login({
        phone: '+84901234567',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(mockAuthService.login).toHaveBeenCalledWith(
        '+84901234567',
        'password123',
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    it('returns tokens on successful password reset', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockTokens);

      const result = await controller.resetPassword({
        otpToken: 'otp-jwt',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'otp-jwt',
        'newpassword123',
        'newpassword123',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns new token pair', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh({ refreshToken: 'raw-token' });

      expect(result).toEqual(mockTokens);
    });
  });

  describe('POST /auth/logout', () => {
    it('calls authService.logout with refresh token', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout({ refreshToken: 'raw-token' });

      expect(mockAuthService.logout).toHaveBeenCalledWith('raw-token');
    });
  });

  describe('GET /auth/me', () => {
    it('returns current user from request', () => {
      const result = controller.me(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
