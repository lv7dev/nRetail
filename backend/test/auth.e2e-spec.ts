import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
import { ResponseInterceptor } from '../src/shared/interceptors/response.interceptor';
import { globalValidationPipe } from '../src/shared/pipes/validation.pipe';

type OtpVerifyResponse = { otpToken: string };
type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
};
type ApiBody<T> = { data: T };

const TEST_JWT_SECRET = 'test-jwt-secret-integration';
const TEST_PHONE = '+84901234567';
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshTokenRepo.create.mockResolvedValue('test-refresh-token');
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

      expect(mockOtpRepo.create).toHaveBeenCalledWith(
        TEST_PHONE,
        '999999',
        'register',
      );

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

      expect(mockOtpRepo.create).toHaveBeenCalledWith(
        TEST_PHONE,
        '999999',
        'reset',
      );

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

      // Using register token in reset-password → 401
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          otpToken,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(401);
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

      // Using reset token in register → 401
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          otpToken,
          name: 'Test User',
          password: 'password123',
          confirmPassword: 'password123',
        })
        .expect(401);
    });
  });

  // ─── Precondition enforcement ────────────────────────────────────────────────

  describe('OTP request preconditions', () => {
    it('returns 409 when requesting register OTP for an already-registered phone', async () => {
      mockUsersService.findByPhone.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/otp/register')
        .send({ phone: TEST_PHONE })
        .expect(409);

      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });

    it('returns 404 when requesting forgot-password OTP for unknown phone', async () => {
      mockUsersService.findByPhone.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/otp/forgot-password')
        .send({ phone: TEST_PHONE })
        .expect(404);

      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });
  });
});
