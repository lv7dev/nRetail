/**
 * Outlets Integration Tests (Group 6)
 *
 * Tests GET /outlets/mine against a real Postgres DB (Docker container on 5433).
 * Creates Outlet and UserOutlet rows directly via PrismaService.
 *
 * Run: cd backend && npm run test:integration
 */
import { INestApplication } from '@nestjs/common';
import { type Server } from 'http';
import request from 'supertest';
import { OutletRole, UserOutletStatus } from '@prisma/client';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { closeTestApp, createTestApp } from '../helpers/app';
import { parseData, parseError } from '../helpers/response';
import { MyOutletResponse } from '../../src/modules/outlets/dto/my-outlet.response';

interface OutletListResponseItem {
  id: string;
  name: string;
  address: string | null;
  role: OutletRole | null;
  membershipStatus?: UserOutletStatus;
}

describe('Outlets Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const TEST_PHONE = '0912345678';
  const TEST_PASSWORD = 'password123';
  const TEST_NAME = 'Outlet Test User';
  const TEST_OTP = '999999';

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Seed PhoneConfig so OTP '999999' is accepted for TEST_PHONE
    await prisma.phoneConfig.upsert({
      where: { phone: TEST_PHONE },
      create: { phone: TEST_PHONE, defaultOtp: TEST_OTP },
      update: { defaultOtp: TEST_OTP },
    });

    // Register a user and get an access token
    await request(app.getHttpServer() as Server)
      .post('/auth/otp/register')
      .send({ phone: TEST_PHONE })
      .expect(200);

    const verifyRes = await request(app.getHttpServer() as Server)
      .post('/auth/otp/verify')
      .send({ phone: TEST_PHONE, otp: TEST_OTP })
      .expect(200);

    const otpToken = (verifyRes.body as { data: { otpToken: string } }).data.otpToken;

    const registerRes = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        otpToken,
        name: TEST_NAME,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      })
      .expect(201);

    const authData = (registerRes.body as { data: { accessToken: string; user: { id: string } } })
      .data;
    accessToken = authData.accessToken;
    userId = authData.user.id;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await prisma.userOutlet.deleteMany();
    await prisma.outlet.deleteMany();
  });

  async function createOutletMembership(params: {
    name: string;
    address?: string | null;
    role: OutletRole;
    status?: UserOutletStatus;
  }) {
    const outlet = await prisma.outlet.create({
      data: { name: params.name, address: params.address ?? null },
    });

    await prisma.userOutlet.create({
      data: {
        userId,
        outletId: outlet.id,
        role: params.role,
        status: params.status,
      },
    });

    return outlet;
  }

  // ---------------------------------------------------------------------------
  // 6.1 — GET /outlets/mine with valid JWT, user has 0 outlet memberships → 200, []
  // ---------------------------------------------------------------------------
  it('6.1 GET /outlets/mine with valid JWT and no memberships → 200 empty array', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/outlets/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const data = parseData<MyOutletResponse[]>(res);
    expect(data).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // 6.2 — GET /outlets/mine with valid JWT, user has 1 outlet membership → 200 with correct shape
  // ---------------------------------------------------------------------------
  it('6.2 GET /outlets/mine with 1 membership → 200 with correct outlet shape', async () => {
    const outlet = await prisma.outlet.create({
      data: { name: 'Test Outlet Alpha', address: '1 Test Street' },
    });
    await prisma.userOutlet.create({
      data: {
        userId,
        outletId: outlet.id,
        role: OutletRole.OWNER,
        status: UserOutletStatus.CONFIRMED,
      },
    });

    const res = await request(app.getHttpServer() as Server)
      .get('/outlets/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const data = parseData<MyOutletResponse[]>(res);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: outlet.id,
      name: 'Test Outlet Alpha',
      address: '1 Test Street',
      role: OutletRole.OWNER,
    });
  });

  // ---------------------------------------------------------------------------
  // 6.3 — GET /outlets/mine with valid JWT, user has 2 outlet memberships → 200 with both outlets
  // ---------------------------------------------------------------------------
  it('6.3 GET /outlets/mine with 2 memberships → 200 with both outlets', async () => {
    const outlet1 = await prisma.outlet.create({
      data: { name: 'Test Outlet Alpha', address: '1 Test Street' },
    });
    await prisma.userOutlet.create({
      data: {
        userId,
        outletId: outlet1.id,
        role: OutletRole.OWNER,
        status: UserOutletStatus.CONFIRMED,
      },
    });

    // Create a second outlet and add the user as MANAGER
    const outlet2 = await prisma.outlet.create({
      data: { name: 'Test Outlet Beta', address: null },
    });
    await prisma.userOutlet.create({
      data: {
        userId,
        outletId: outlet2.id,
        role: OutletRole.MANAGER,
        status: UserOutletStatus.CONFIRMED,
      },
    });

    const res = await request(app.getHttpServer() as Server)
      .get('/outlets/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const data = parseData<MyOutletResponse[]>(res);
    expect(data).toHaveLength(2);

    const ids = data.map((o) => o.id);
    expect(ids).toContain(outlet2.id);

    const beta = data.find((o) => o.id === outlet2.id);
    expect(beta).toMatchObject({
      name: 'Test Outlet Beta',
      address: null,
      role: OutletRole.MANAGER,
    });
  });

  // ---------------------------------------------------------------------------
  // 6.4 — GET /outlets/mine without JWT → 401
  // ---------------------------------------------------------------------------
  it('6.4 GET /outlets/mine without JWT → 401', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/outlets/mine')
      .expect(401);

    expect(res.status).toBe(401);
    // Verify it's a proper error response (not wrapped in data)
    expect(parseError(res)).toBeDefined();
  });

  it('returns only confirmed memberships for GET /outlets?connected=true', async () => {
    const confirmedOutlet = await createOutletMembership({
      name: 'Confirmed Outlet',
      role: OutletRole.OWNER,
      status: UserOutletStatus.CONFIRMED,
    });
    await createOutletMembership({
      name: 'Pending Outlet',
      role: OutletRole.MANAGER,
      status: UserOutletStatus.PENDING,
    });
    await createOutletMembership({
      name: 'Rejected Outlet',
      role: OutletRole.STAFF,
      status: UserOutletStatus.REJECTED,
    });

    const res = await request(app.getHttpServer() as Server)
      .get('/outlets?connected=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const payload = parseData<{ data: OutletListResponseItem[]; meta: { nextCursor: string | null } }>(
      res,
    );

    expect(payload.meta.nextCursor).toBeNull();
    expect(payload.data).toEqual([
      expect.objectContaining({
        id: confirmedOutlet.id,
        name: 'Confirmed Outlet',
        role: OutletRole.OWNER,
      }),
    ]);
  });

  it('returns only pending and rejected memberships for GET /outlets?connected=false', async () => {
    await createOutletMembership({
      name: 'Confirmed Only',
      role: OutletRole.OWNER,
      status: UserOutletStatus.CONFIRMED,
    });
    const pendingOutlet = await createOutletMembership({
      name: 'Pending Only',
      role: OutletRole.MANAGER,
      status: UserOutletStatus.PENDING,
    });
    const rejectedOutlet = await createOutletMembership({
      name: 'Rejected Only',
      role: OutletRole.STAFF,
      status: UserOutletStatus.REJECTED,
    });
    await prisma.outlet.create({
      data: { name: 'Unassigned Outlet', address: 'No Membership Street' },
    });

    const res = await request(app.getHttpServer() as Server)
      .get('/outlets?connected=false')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const payload = parseData<{ data: OutletListResponseItem[]; meta: { nextCursor: string | null } }>(
      res,
    );

    expect(payload.meta.nextCursor).toBeNull();
    expect(payload.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: pendingOutlet.id,
          name: 'Pending Only',
          role: null,
          membershipStatus: UserOutletStatus.PENDING,
        }),
        expect.objectContaining({
          id: rejectedOutlet.id,
          name: 'Rejected Only',
          role: null,
          membershipStatus: UserOutletStatus.REJECTED,
        }),
      ]),
    );
    expect(payload.data).toHaveLength(2);
  });

  it('excludes pending and rejected memberships from GET /outlets/mine', async () => {
    const confirmedOutlet = await createOutletMembership({
      name: 'Mine Confirmed',
      role: OutletRole.OWNER,
      status: UserOutletStatus.CONFIRMED,
    });
    await createOutletMembership({
      name: 'Mine Pending',
      role: OutletRole.MANAGER,
      status: UserOutletStatus.PENDING,
    });
    await createOutletMembership({
      name: 'Mine Rejected',
      role: OutletRole.STAFF,
      status: UserOutletStatus.REJECTED,
    });

    const res = await request(app.getHttpServer() as Server)
      .get('/outlets/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const data = parseData<MyOutletResponse[]>(res);

    expect(data).toEqual([
      expect.objectContaining({
        id: confirmedOutlet.id,
        name: 'Mine Confirmed',
        role: OutletRole.OWNER,
      }),
    ]);
  });

  it('confirms a pending membership through PATCH /outlets/:outletId/membership', async () => {
    const outlet = await createOutletMembership({
      name: 'Confirm Pending Outlet',
      role: OutletRole.OWNER,
      status: UserOutletStatus.PENDING,
    });

    await request(app.getHttpServer() as Server)
      .patch(`/outlets/${outlet.id}/membership`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ action: 'confirm' })
      .expect(200);

    const membership = await prisma.userOutlet.findUniqueOrThrow({
      where: { userId_outletId: { userId, outletId: outlet.id } },
    });

    expect(membership.status).toBe(UserOutletStatus.CONFIRMED);
  });

  it('re-confirms a rejected membership through PATCH /outlets/:outletId/membership', async () => {
    const outlet = await createOutletMembership({
      name: 'Reconfirm Outlet',
      role: OutletRole.OWNER,
      status: UserOutletStatus.REJECTED,
    });

    await request(app.getHttpServer() as Server)
      .patch(`/outlets/${outlet.id}/membership`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ action: 'confirm' })
      .expect(200);

    const membership = await prisma.userOutlet.findUniqueOrThrow({
      where: { userId_outletId: { userId, outletId: outlet.id } },
    });

    expect(membership.status).toBe(UserOutletStatus.CONFIRMED);
  });

  it('rejects a pending membership through PATCH /outlets/:outletId/membership', async () => {
    const outlet = await createOutletMembership({
      name: 'Reject Pending Outlet',
      role: OutletRole.OWNER,
      status: UserOutletStatus.PENDING,
    });

    await request(app.getHttpServer() as Server)
      .patch(`/outlets/${outlet.id}/membership`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ action: 'reject' })
      .expect(200);

    const membership = await prisma.userOutlet.findUniqueOrThrow({
      where: { userId_outletId: { userId, outletId: outlet.id } },
    });

    expect(membership.status).toBe(UserOutletStatus.REJECTED);
  });

  it('returns 422 when rejecting a confirmed membership', async () => {
    const outlet = await createOutletMembership({
      name: 'Reject Confirmed Outlet',
      role: OutletRole.OWNER,
      status: UserOutletStatus.CONFIRMED,
    });

    const res = await request(app.getHttpServer() as Server)
      .patch(`/outlets/${outlet.id}/membership`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ action: 'reject' })
      .expect(422);

    expect(parseError(res)).toMatchObject({
      statusCode: 422,
    });
  });

  it('returns 404 when updating a non-existent membership', async () => {
    const outlet = await prisma.outlet.create({
      data: { name: 'Missing Membership Outlet', address: '404 Street' },
    });

    const res = await request(app.getHttpServer() as Server)
      .patch(`/outlets/${outlet.id}/membership`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ action: 'confirm' })
      .expect(404);

    expect(parseError(res)).toMatchObject({
      statusCode: 404,
    });
  });
});
