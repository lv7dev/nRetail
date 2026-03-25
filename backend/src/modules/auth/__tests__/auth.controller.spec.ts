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
  requestOtp: jest.fn(),
  verifyOtp: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/otp/request', () => {
    it('calls authService.requestOtp and returns void', async () => {
      mockAuthService.requestOtp.mockResolvedValue(undefined);

      await controller.requestOtp({ phone: '+84901234567' });

      expect(mockAuthService.requestOtp).toHaveBeenCalledWith('+84901234567');
    });
  });

  describe('POST /auth/otp/verify', () => {
    it('returns tokens when existing user verifies OTP', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      const result = await controller.verifyOtp({
        phone: '+84901234567',
        otp: '999999',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('returns registrationToken for new user', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({
        registrationToken: 'reg-token',
      });

      const result = await controller.verifyOtp({
        phone: '+84999999999',
        otp: '999999',
      });

      expect(result).toHaveProperty('registrationToken');
    });
  });

  describe('POST /auth/register', () => {
    it('returns tokens and user on successful registration', async () => {
      mockAuthService.register.mockResolvedValue({
        ...mockTokens,
        user: mockUser,
      });

      const result = await controller.register({
        registrationToken: 'reg-token',
        name: 'Test User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'reg-token',
        'Test User',
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
