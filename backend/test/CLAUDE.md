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
│   ├── app.ts                   # createTestApp() / closeTestApp()
│   └── response.ts              # parseData<T>() / parseError() — typed response helpers
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

### `helpers/response.ts`

Typed helpers for parsing supertest response bodies. `supertest`'s `res.body` is typed as `any` — these helpers isolate the unsafe cast in one place so test assertions are fully typed.

```ts
import { parseData, parseError } from '../helpers/response'
import type { AuthResponse, OtpVerifyResponse, TokenPairResponse } from '../../src/modules/auth/dto/auth.response'
import type { UserResponse } from '../../src/modules/auth/dto/user.response'

// Success responses — wrapped in { data: T } by ResponseInterceptor
const data = parseData<AuthResponse>(res)        // → AuthResponse
const data = parseData<OtpVerifyResponse>(res)   // → OtpVerifyResponse
const data = parseData<TokenPairResponse>(res)   // → TokenPairResponse
const data = parseData<UserResponse>(res)        // → UserResponse

// Error responses — NOT wrapped, direct { statusCode, message, code }
const err = parseError(res)                      // → ErrorResponse
expect(err.code).toBe('INVALID_CREDENTIALS')
```

**Rule**: Never use `res.body.data` or `res.body as SomeType` directly in test files. Always go through `parseData<T>` or `parseError`.

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
import { INestApplication } from '@nestjs/common'
import { type Server } from 'http'   // needed to cast app.getHttpServer()
import request from 'supertest'
import { createTestApp, closeTestApp } from '../helpers/app'
import { parseData, parseError } from '../helpers/response'
import { PrismaService } from '../../src/shared/database/prisma.service'

describe('POST /products', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await closeTestApp(app)
  })

  it('creates a product', async () => {
    // Cast getHttpServer() as Server — INestApplication types it as `any`
    const res = await request(app.getHttpServer() as Server)
      .post('/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test', price: 10000 })
      .expect(201)

    // Use parseData<T> — never access res.body.data directly
    const data = parseData<ProductResponse>(res)
    expect(data.name).toBe('Test')
  })

  it('rejects invalid input', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/products')
      .send({})
      .expect(400)

    // Use parseError — never access res.body.code directly
    expect(parseError(res).code).toBeDefined()
  })
})
```

## Rules

- Always call `closeTestApp(app)` in `afterAll` — leaking app instances prevents Jest from exiting
- Use `--runInBand` (already set in `package.json`) — parallel files corrupt the shared DB
- Name files `*.integration.spec.ts` — the Jest config only picks up this pattern
- Use `TEST_OTP` constant (`999999`) for OTP bypass — don't hardcode the string
- Upsert `PhoneConfig` in `beforeAll` with `update: { defaultOtp: TEST_OTP }` to handle stale rows

## Typing Pitfalls

### `app.getHttpServer()` returns `any`

`INestApplication.getHttpServer()` is typed as `any` by NestJS (it supports both Express and Fastify adapters). Passing it directly to `request()` triggers `@typescript-eslint/no-unsafe-argument`.

**Always cast it:**

```ts
import { type Server } from 'http'

request(app.getHttpServer() as Server)
```

### `pg` query results are `any[]`

`client.query()` returns `QueryResult<any>` by default, making `rows[0]` untyped. Access any property on it and ESLint reports `no-unsafe-member-access`.

**Always pass a row type generic:**

```ts
// ❌ rows[0].current_database → unsafe member access
const res = await client.query('SELECT current_database()')

// ✅ rows[0].current_database → typed as string
const res = await client.query<{ current_database: string }>('SELECT current_database()')
```

For multi-column queries, define a local interface:

```ts
interface TableRow { table_name: string }
const res = await client.query<TableRow>(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
)
expect(res.rows[0].table_name).toBe('User')
```
