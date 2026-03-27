# Integration Tests

Real-database integration tests for backend endpoints. Tests in `test/` spin up a full NestJS application connected to a dedicated Docker Postgres instance.

## Running

```bash
# From backend/
npm run test:integration
```

Requires Docker to be running. The global setup starts a `postgres:15-alpine` container automatically on **port 5433** (separate from the dev DB on port 5434).

## Folder Structure

```
test/
├── jest-integration.config.ts   # Separate Jest config for integration tests
├── global-setup.ts              # Start Docker Postgres, create DB, run migrations
├── global-teardown.ts           # Truncate all tables (container stays running)
├── constants.ts                 # TEST_DB_URL, TEST_OTP
├── helpers/
│   └── app.ts                   # createTestApp() / closeTestApp()
└── auth/
    └── auth.integration.spec.ts # Auth endpoint integration tests (10 tests)
```

## Key Files

### `jest-integration.config.ts`

```ts
{
  rootDir: '../',
  testMatch: ['**/test/**/*.integration.spec.ts'],
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
}
```

Run with `--runInBand` (configured in `package.json`) to prevent parallel test files from corrupting the shared DB.

### `global-setup.ts`

Runs once before all test files:
1. Starts `postgres:15-alpine` Docker container on port 5433 (or reuses existing)
2. Creates `test_nretail` database if it doesn't exist
3. Runs `npx prisma migrate deploy` from `backend/`
4. Sets `process.env.DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`

### `global-teardown.ts`

Runs once after all test files. Truncates all tables dynamically (self-maintains as schema grows):
```sql
TRUNCATE TABLE "User", "RefreshToken", ... RESTART IDENTITY CASCADE
```
Does **not** stop the Docker container — keeping it running makes re-runs fast.

### `helpers/app.ts`

```ts
export async function createTestApp(): Promise<INestApplication>
export async function closeTestApp(app: INestApplication): Promise<void>
```

Creates a full NestJS app instance with the same global pipes, interceptors, and filters as `main.ts`. Always call `closeTestApp(app)` in `afterAll` to release DB connections.

### `constants.ts`

```ts
export const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5433/test_nretail'
export const TEST_OTP = '999999'
```

## OTP Bypass

Insert a `PhoneConfig` row to bypass real SMS in tests:

```ts
await prisma.phoneConfig.upsert({
  where: { phone: TEST_PHONE },
  create: { phone: TEST_PHONE, defaultOtp: TEST_OTP },
  update: { defaultOtp: TEST_OTP },
})
```

When a `PhoneConfig` row exists for a phone number, the backend accepts `TEST_OTP` (`999999`) as a valid OTP for any purpose.

## Writing a New Integration Test

```ts
import request from 'supertest'
import { createTestApp, closeTestApp } from '../helpers/app'
import { PrismaClient } from '@prisma/client'

describe('POST /products', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    app = await createTestApp()
    prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await closeTestApp(app)
  })

  it('creates a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test', price: 10000 })
      .expect(201)

    expect(res.body.data.name).toBe('Test')
  })
})
```

## Rules

- Always call `closeTestApp(app)` in `afterAll` — leaking app instances prevents Jest from exiting
- Use `--runInBand` (already set in `package.json`) — parallel files corrupt the shared DB
- Name files `*.integration.spec.ts` — the Jest config only picks up this pattern
- Use `TEST_OTP` constant (`999999`) for OTP bypass — don't hardcode the string
- Upsert `PhoneConfig` in `beforeAll` with `update: { defaultOtp: TEST_OTP }` to handle stale rows
