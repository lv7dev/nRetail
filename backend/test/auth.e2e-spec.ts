import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { OtpRepository } from '../src/modules/auth/otp.repository';
import { PhoneConfigRepository } from '../src/modules/auth/phone-config.repository';
import { RefreshTokenRepository } from '../src/modules/auth/refresh-token.repository';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';
import { UsersService } from '../src/modules/users/users.service';
import { AllExceptionsFilter } from '../src/shared/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/shared/interceptors/response.interceptor';
import { globalValidationPipe } from '../src/shared/pipes/validation.pipe';

type OtpVerifyResponse = { otpToken: string };
type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
};
type ApiBody<T> = { data: T };
type ErrorBody = {
  statusCode: number;
  message: string;
  code?: string;
  errors?: {
    field: string;
    constraint?: string;
    params?: Record<string, unknown>;
    message: string;
  }[];
};

const TEST_JWT_SECRET = 'test-jwt-secret-integration';
const TEST_PHONE = '0901234567';
const TEST_PASSWORD = 'password123';

const mockUser = {
  id: 'user-1',
  phone: TEST_PHONE,
  name: 'Test User',
  password: 'will-be-set-in-beforeAll',
  role: Role.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOtpRepo = {
  findByPhone: jest.fn(),
  deleteByPhone: jest.fn(),
  create: jest.fn(),
  incrementAttempts: jest.fn(),
  delete: jest.fn(),
};

const mockPhoneConfigRepo = {
  findByPhone: jest.fn(),
  upsert: jest.fn(),
};

const mockRefreshTokenRepo = {
  create: jest.fn(),
  findAndDelete: jest.fn(),
  deleteAllByUserId: jest.fn(),
  deleteExpiredByUserId: jest.fn(),
  countActiveByUserId: jest.fn(),
  deleteOldestByUserId: jest.fn(),
};

const mockUsersService = {
  findByPhone: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updatePassword: jest.fn(),
};

describe('Auth (integration)', () => {
  let app: INestApplication<App>;
  let testOtpHash: string;
  let testPasswordHash: string;

  beforeAll(async () => {
    testOtpHash = await bcrypt.hash('999999', 8);
    testPasswordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    mockUser.password = testPasswordHash;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        ThrottlerModule.forRoot([{ limit: 100, ttl: 60000 }]),
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '7d' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: OtpRepository, useValue: mockOtpRepo },
        { provide: PhoneConfigRepository, useValue: mockPhoneConfigRepo },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepo },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: 'JWT_SECRET',
          useValue: TEST_JWT_SECRET,
        },
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(globalValidationPipe);
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshTokenRepo.create.mockResolvedValue('test-refresh-token');
    mockRefreshTokenRepo.deleteExpiredByUserId.mockResolvedValue(undefined);
    mockRefreshTokenRepo.countActiveByUserId.mockResolvedValue(0);
    mockRefreshTokenRepo.deleteOldestByUserId.mockResolvedValue(undefined);
    mockPhoneConfigRepo.findByPhone.mockResolvedValue(null);
    mockOtpRepo.deleteByPhone.mockResolvedValue(undefined);
    mockOtpRepo.create.mockResolvedValue(undefined);
    mockOtpRepo.delete.mockResolvedValue(undefined);
  });

  // ─── Full flow: Register ────────────────────────────────────────────────────

  describe('Register flow', () => {
    it('completes the full register flow: request OTP → verify → register', async () => {
      // Step 1: Request OTP for new phone
      mockUsersService.findByPhone.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/otp/register')
        .send({ phone: TEST_PHONE })
        .expect(200);

      expect(mockOtpRepo.create).toHaveBeenCalledWith(TEST_PHONE, '999999', 'register');

      // Step 2: Verify OTP
      mockOtpRepo.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_PHONE,
        otpHash: testOtpHash,
        purpose: 'register',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: TEST_PHONE, otp: '999999' })
        .expect(200);

      const { otpToken } = (verifyRes.body as ApiBody<OtpVerifyResponse>).data;
      expect(otpToken).toBeDefined();
      expect(typeof otpToken).toBe('string');

      // Step 3: Register with otpToken + password
      mockUsersService.findByPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          otpToken,
          name: 'Test User',
          password: TEST_PASSWORD,
          confirmPassword: TEST_PASSWORD,
        })
        .expect(201);

      const registerBody = (registerRes.body as ApiBody<AuthResponse>).data;
      expect(registerBody).toHaveProperty('accessToken');
      expect(registerBody).toHaveProperty('refreshToken', 'test-refresh-token');
      expect(registerBody.user).toMatchObject({
        id: 'user-1',
        phone: TEST_PHONE,
      });
    });
  });

  // ─── Full flow: Login ───────────────────────────────────────────────────────

  describe('Login flow', () => {
    it('returns tokens for valid phone and password', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
        .expect(200);

      const loginBody = (res.body as ApiBody<AuthResponse>).data;
      expect(loginBody).toHaveProperty('accessToken');
      expect(loginBody).toHaveProperty('refreshToken');
      expect(loginBody.user).toMatchObject({ phone: TEST_PHONE });
    });
  });

  // ─── Full flow: Forgot Password ─────────────────────────────────────────────

  describe('Forgot-password flow', () => {
    it('completes the full forgot-password flow: request OTP → verify → reset', async () => {
      // Step 1: Request OTP for existing user
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/otp/forgot-password')
        .send({ phone: TEST_PHONE })
        .expect(200);

      expect(mockOtpRepo.create).toHaveBeenCalledWith(TEST_PHONE, '999999', 'reset');

      // Step 2: Verify OTP
      mockOtpRepo.findByPhone.mockResolvedValue({
        id: 'otp-2',
        phone: TEST_PHONE,
        otpHash: testOtpHash,
        purpose: 'reset',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: TEST_PHONE, otp: '999999' })
        .expect(200);

      const { otpToken } = (verifyRes.body as ApiBody<OtpVerifyResponse>).data;

      // Step 3: Reset password
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const resetRes = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          otpToken,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(200);

      const resetBody = (resetRes.body as ApiBody<AuthResponse>).data;
      expect(resetBody).toHaveProperty('accessToken');
      expect(resetBody).toHaveProperty('refreshToken');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        expect.stringMatching(/^\$2[ab]\$/),
      );
    });
  });

  // ─── Cross-flow rejection tests ──────────────────────────────────────────────

  describe('Cross-flow token rejections', () => {
    it('rejects a register-purpose otpToken in reset-password endpoint', async () => {
      // Get a register-purpose token
      mockOtpRepo.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_PHONE,
        otpHash: testOtpHash,
        purpose: 'register',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: TEST_PHONE, otp: '999999' })
        .expect(200);

      const { otpToken } = (verifyRes.body as ApiBody<OtpVerifyResponse>).data;

      // Using register token in reset-password → 401 with OTP_PURPOSE_MISMATCH
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          otpToken,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(401);

      expect((res.body as ErrorBody).code).toBe('OTP_PURPOSE_MISMATCH');
    });

    it('rejects a reset-purpose otpToken in register endpoint', async () => {
      // Get a reset-purpose token
      mockOtpRepo.findByPhone.mockResolvedValue({
        id: 'otp-2',
        phone: TEST_PHONE,
        otpHash: testOtpHash,
        purpose: 'reset',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: TEST_PHONE, otp: '999999' })
        .expect(200);

      const { otpToken } = (verifyRes.body as ApiBody<OtpVerifyResponse>).data;

      // Using reset token in register → 401 with OTP_PURPOSE_MISMATCH
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          otpToken,
          name: 'Test User',
          password: 'password123',
          confirmPassword: 'password123',
        })
        .expect(401);

      expect((res.body as ErrorBody).code).toBe('OTP_PURPOSE_MISMATCH');
    });
  });

  // ─── Precondition enforcement ────────────────────────────────────────────────

  describe('OTP request preconditions', () => {
    it('returns 409 with code PHONE_ALREADY_EXISTS when requesting register OTP for an already-registered phone', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/otp/register')
        .send({ phone: TEST_PHONE })
        .expect(409);

      expect((res.body as ErrorBody).code).toBe('PHONE_ALREADY_EXISTS');
      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });

    it('returns 404 with code PHONE_NOT_FOUND when requesting forgot-password OTP for unknown phone', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/otp/forgot-password')
        .send({ phone: TEST_PHONE })
        .expect(404);

      expect((res.body as ErrorBody).code).toBe('PHONE_NOT_FOUND');
      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── Validation error surface ─────────────────────────────────────────────────

  describe('Validation error responses', () => {
    it('returns field-level errors when password is too short', async () => {
      mockOtpRepo.findByPhone.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_PHONE,
        otpHash: testOtpHash,
        purpose: 'register',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });
      const verifyRes = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: TEST_PHONE, otp: '999999' })
        .expect(200);

      const { otpToken } = (verifyRes.body as ApiBody<OtpVerifyResponse>).data;

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          otpToken,
          name: 'Test User',
          password: '12345',
          confirmPassword: '12345',
        })
        .expect(400);

      const body = res.body as ErrorBody;
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            constraint: 'minLength',
            params: { min: 6 },
          }),
        ]),
      );
    });

    it('returns field-level errors when required fields are missing on login', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);

      const body = res.body as ErrorBody;
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });

  // ─── Rate limiting ────────────────────────────────────────────────────────────

  describe('Rate limiting', () => {
    let throttleApp: INestApplication<App>;

    beforeAll(async () => {
      // Separate app with a very low limit (2 per window) to test 429
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          PassportModule,
          ThrottlerModule.forRoot([{ limit: 2, ttl: 60000 }]),
          JwtModule.register({
            secret: TEST_JWT_SECRET,
            signOptions: { expiresIn: '7d' },
          }),
        ],
        controllers: [AuthController],
        providers: [
          { provide: APP_GUARD, useClass: ThrottlerGuard },
          AuthService,
          JwtStrategy,
          { provide: OtpRepository, useValue: mockOtpRepo },
          { provide: PhoneConfigRepository, useValue: mockPhoneConfigRepo },
          { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepo },
          { provide: UsersService, useValue: mockUsersService },
          { provide: 'JWT_SECRET', useValue: TEST_JWT_SECRET },
        ],
      })
        .overrideProvider(JwtStrategy)
        .useValue({})
        .compile();

      throttleApp = moduleFixture.createNestApplication();
      throttleApp.useGlobalPipes(globalValidationPipe);
      throttleApp.useGlobalInterceptors(new ResponseInterceptor());
      throttleApp.useGlobalFilters(new AllExceptionsFilter());
      await throttleApp.init();
    });

    afterAll(async () => {
      await throttleApp.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      mockRefreshTokenRepo.deleteExpiredByUserId.mockResolvedValue(undefined);
      mockRefreshTokenRepo.countActiveByUserId.mockResolvedValue(0);
      mockRefreshTokenRepo.deleteOldestByUserId.mockResolvedValue(undefined);
    });

    it('returns 429 after exceeding login rate limit', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null); // all logins fail with 401

      // Login has @Throttle({ default: { limit: 10, ttl: 60_000 } }) override
      // Send 10 requests that pass through throttle (but fail auth → 401)
      for (let i = 0; i < 10; i++) {
        await request(throttleApp.getHttpServer())
          .post('/auth/login')
          .send({ phone: TEST_PHONE, password: 'wrong' })
          .expect(401);
      }

      // 11th request hits the rate limit
      const res = await request(throttleApp.getHttpServer())
        .post('/auth/login')
        .send({ phone: TEST_PHONE, password: 'wrong' })
        .expect(429);

      expect(res.status).toBe(429);
    });
  });

  // ─── Session cap ──────────────────────────────────────────────────────────────

  describe('Session cap', () => {
    it('evicts oldest token when user already has 5 active sessions on login', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockRefreshTokenRepo.countActiveByUserId.mockResolvedValue(5);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
        .expect(200);

      expect(mockRefreshTokenRepo.deleteOldestByUserId).toHaveBeenCalledWith('user-1');
    });

    it('does not evict when user has fewer than 5 active sessions', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);
      mockRefreshTokenRepo.countActiveByUserId.mockResolvedValue(3);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
        .expect(200);

      expect(mockRefreshTokenRepo.deleteOldestByUserId).not.toHaveBeenCalled();
    });
  });
});
