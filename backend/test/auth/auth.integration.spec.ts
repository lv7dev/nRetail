/**
 * Auth Integration Tests (Group 5)
 *
 * Tests all auth endpoints against a real Postgres DB (Docker container on 5433).
 * Uses PhoneConfig bypass: any phone with a PhoneConfig row accepts OTP '999999'.
 *
 * Run: cd backend && npm run test:integration
 */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  AuthResponse,
  OtpVerifyResponse,
  TokenPairResponse,
} from '../../src/modules/auth/dto/auth.response';
import { UserResponse } from '../../src/modules/auth/dto/user.response';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { closeTestApp, createTestApp } from '../helpers/app';
import { parseData, parseError } from '../helpers/response';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const TEST_PHONE = '0901234567';
  const TEST_PASSWORD = 'password123';
  const TEST_NAME = 'Test User';
  const TEST_OTP = '999999';

  // Shared state passed between sequential tests
  let otpToken: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Seed PhoneConfig so OTP '999999' is accepted for TEST_PHONE
    await prisma.phoneConfig.upsert({
      where: { phone: TEST_PHONE },
      create: { phone: TEST_PHONE, defaultOtp: TEST_OTP },
      update: { defaultOtp: TEST_OTP },
    });
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  // ---------------------------------------------------------------------------
  // 5.1 — POST /auth/otp/register with valid phone → 200, OTP record created
  // ---------------------------------------------------------------------------
  it('5.1 POST /auth/otp/register with valid phone → 200 and OTP record in DB', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/otp/register')
      .send({ phone: TEST_PHONE })
      .expect(200);

    // void endpoints return empty body (ResponseInterceptor does not wrap void)
    expect(res.body).toBeDefined();

    // Verify OTP record was written to DB
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: TEST_PHONE },
    });
    expect(otpRecord).not.toBeNull();
    expect(otpRecord!.phone).toBe(TEST_PHONE);
    expect(otpRecord!.purpose).toBe('register');
  });

  // ---------------------------------------------------------------------------
  // 5.2 — POST /auth/otp/verify with valid OTP → 200 with otpToken JWT
  // ---------------------------------------------------------------------------
  it('5.2 POST /auth/otp/verify with valid OTP → 200 with otpToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ phone: TEST_PHONE, otp: TEST_OTP })
      .expect(200);

    const data = parseData<OtpVerifyResponse>(res);
    expect(data).toHaveProperty('otpToken');
    expect(typeof data.otpToken).toBe('string');
    expect(data.otpToken.length).toBeGreaterThan(0);

    otpToken = data.otpToken;
  });

  // ---------------------------------------------------------------------------
  // 5.3 — POST /auth/register with valid otpToken → 201, user in DB, token pair
  // ---------------------------------------------------------------------------
  it('5.3 POST /auth/register with valid otpToken → 201, user created, returns token pair', async () => {
    if (!otpToken) throw new Error('Prerequisite: test 5.2 (verifyOtp) must have set otpToken');
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        otpToken,
        name: TEST_NAME,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      })
      .expect(201);

    const data = parseData<AuthResponse>(res);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('user');
    expect(data.user.phone).toBe(TEST_PHONE);
    expect(data.user.name).toBe(TEST_NAME);
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('role');

    // Verify user was actually created in DB
    const dbUser = await prisma.user.findUnique({ where: { phone: TEST_PHONE } });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.name).toBe(TEST_NAME);

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // ---------------------------------------------------------------------------
  // 5.4 — POST /auth/login with valid credentials → 200 with token pair
  // ---------------------------------------------------------------------------
  it('5.4 POST /auth/login with valid credentials → 200 with token pair', async () => {
    if (!accessToken)
      throw new Error('Prerequisite: test 5.3 (register) must have set accessToken');
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
      .expect(200);

    const data = parseData<AuthResponse>(res);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('user');
    expect(data.user.phone).toBe(TEST_PHONE);

    // Update shared tokens to use the login-issued ones for subsequent tests
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // ---------------------------------------------------------------------------
  // 5.5 — POST /auth/login with wrong password → 401 with INVALID_CREDENTIALS
  // ---------------------------------------------------------------------------
  it('5.5 POST /auth/login with wrong password → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: 'wrongpassword' })
      .expect(401);

    expect(parseError(res).code).toBe('INVALID_CREDENTIALS');
  });

  // ---------------------------------------------------------------------------
  // 5.6 — POST /auth/refresh with valid refresh token → 200, old token invalidated
  // ---------------------------------------------------------------------------
  it('5.6 POST /auth/refresh with valid refresh token → 200 with new token pair, old token invalidated', async () => {
    const oldRefreshToken = refreshToken;

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    const data = parseData<TokenPairResponse>(res);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(typeof data.accessToken).toBe('string');
    expect(typeof data.refreshToken).toBe('string');

    // New tokens must be different from old ones
    expect(data.refreshToken).not.toBe(oldRefreshToken);

    // After rotation, verify old token is truly invalidated
    const replayRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: oldRefreshToken });
    expect(replayRes.status).toBe(401);
    expect(parseError(replayRes).code).toBe('REFRESH_TOKEN_INVALID');

    // Store new tokens for subsequent tests
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // ---------------------------------------------------------------------------
  // 5.7 — POST /auth/refresh with invalid token → 401 REFRESH_TOKEN_INVALID
  // ---------------------------------------------------------------------------
  it('5.7 POST /auth/refresh with invalid token → 401 REFRESH_TOKEN_INVALID', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'invalid-token-that-does-not-exist-in-db' })
      .expect(401);

    expect(parseError(res).code).toBe('REFRESH_TOKEN_INVALID');
  });

  // ---------------------------------------------------------------------------
  // 5.8 — POST /auth/logout — refresh token removed from DB → 204
  // ---------------------------------------------------------------------------
  it('5.8 POST /auth/logout → 204, refresh token removed from DB', async () => {
    const tokenToInvalidate = refreshToken;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken: tokenToInvalidate })
      .expect(204);

    // Verify refresh token was removed from DB
    const prefix = tokenToInvalidate.substring(0, 8);
    const tokenInDb = await prisma.refreshToken.findFirst({
      where: { tokenPrefix: prefix },
    });
    expect(tokenInDb).toBeNull();

    // Login again to restore tokens for remaining tests
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: TEST_PASSWORD });
    expect(loginRes.status).toBe(200);

    const loginData = parseData<AuthResponse>(loginRes);
    expect(loginData.accessToken).toBeTruthy();
    accessToken = loginData.accessToken;
    refreshToken = loginData.refreshToken;
  });

  // ---------------------------------------------------------------------------
  // 5.9 — GET /auth/me with valid Bearer → 200 with user fields
  // ---------------------------------------------------------------------------
  it('5.9 GET /auth/me with valid Bearer → 200 with user fields', async () => {
    if (!accessToken)
      throw new Error('Prerequisite: test 5.8 (logout + re-login) must have set accessToken');
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const data = parseData<UserResponse>(res);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('phone');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('role');
    expect(data.phone).toBe(TEST_PHONE);
    expect(data.name).toBe(TEST_NAME);
  });

  // ---------------------------------------------------------------------------
  // 5.10 — POST /auth/reset-password with valid otpToken → 200, new password works
  // ---------------------------------------------------------------------------
  it('5.10 POST /auth/reset-password → 200, new password works on login', async () => {
    const NEW_PASSWORD = 'newpassword456';

    // Step 1: Request OTP via forgot-password flow (phone must already exist)
    await request(app.getHttpServer())
      .post('/auth/otp/forgot-password')
      .send({ phone: TEST_PHONE })
      .expect(200);

    // Step 2: Verify OTP → get otpToken for reset
    const verifyRes = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ phone: TEST_PHONE, otp: TEST_OTP })
      .expect(200);

    const resetOtpToken: string = parseData<OtpVerifyResponse>(verifyRes).otpToken;
    expect(resetOtpToken).toBeTruthy();

    // Step 3: Reset password with the reset otpToken
    const resetRes = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        otpToken: resetOtpToken,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      })
      .expect(200);

    const resetData = parseData<TokenPairResponse>(resetRes);
    expect(resetData).toHaveProperty('accessToken');
    expect(resetData).toHaveProperty('refreshToken');
    // reset-password returns TokenPair only (no user field — differs from register/login)

    // Step 4: Verify new password works on login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: NEW_PASSWORD })
      .expect(200);

    const loginData = parseData<AuthResponse>(loginRes);
    expect(loginData).toHaveProperty('accessToken');
    expect(loginData.user.phone).toBe(TEST_PHONE);

    // Step 5: Verify old password no longer works
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
      .expect(401);
  });
});
