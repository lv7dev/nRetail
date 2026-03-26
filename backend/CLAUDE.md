# nRetail Backend — CLAUDE.md

## Project Overview

NestJS v11 backend for **nRetail**, a multi-service ecommerce platform. This service acts as the core API gateway / monolith that other frontend clients (web, mobile, POS) consume. Stack: **NestJS 11 + TypeScript 5 + Node 22, target ES2023**.

---

## Running Locally

### 1. Start infrastructure (Docker)

```bash
docker compose up -d    # start PostgreSQL (port 5434) + Redis (port 6379)
docker compose down     # stop
docker compose ps       # check status
```

### 2. Run the app

```bash
npm install             # first time only
npm run start:dev       # dev server with hot reload
```

- API: `http://localhost:PORT` (PORT from `.env`, default varies — avoid 3000/5000 on macOS)
- Swagger: `http://localhost:PORT/api/docs`

> **macOS port conflicts:** Port 5000 is reserved by AirPlay/Control Center. Port 3000 may be used by the miniapp dev server. Use `PORT=4000` or `PORT=8000` in `.env`.

### 3. Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | Change if port conflicts — avoid 3000, 5000 on macOS |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `DATABASE_URL` | — | PostgreSQL URL — Docker: `postgresql://nretail:nretail@localhost:5434/nretail` |
| `REDIS_URL` | — | Redis URL — Docker: `redis://localhost:6379` |
| `JWT_SECRET` | — | Min 16 chars |
| `JWT_EXPIRES_IN` | `7d` | e.g. `7d`, `24h` |
| `THROTTLE_LIMIT` | `100` | Global rate limit — requests per window |
| `THROTTLE_TTL` | `60` | Global rate limit window in seconds |

## Build & Test

```bash
npm run build        # compile to dist/
npm run start:prod   # run compiled output
npm run lint         # ESLint + Prettier auto-fix
npm run test         # unit tests (Jest)
npm run test:e2e     # end-to-end tests
npm run test:cov     # coverage report
```

---

## Architecture Overview

### Pattern: Modular Monolith

One deployable app, clearly separated feature modules. Each module owns its own controller, service, and data access. When the project grows, each module is already self-contained and can be extracted into a microservice.

**Two rules that keep the monolith clean:**
1. **Modules never import each other's repositories** — only exported Services
2. **Cross-module side effects use events** (`@nestjs/event-emitter`) — so decoupling is free

```
src/
  main.ts
  app.module.ts
  modules/
    auth/
    users/
    catalog/
      products/
      categories/
      brands/
      inventory/
    orders/
    payments/
    shipping/
    promotions/          # coupons, discounts, flash sales
    reviews/
    notifications/
    search/
    admin/
  shared/
    database/
      prisma.service.ts
      prisma.module.ts
    cache/
      redis.module.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    interceptors/
      response.interceptor.ts   # wraps all responses in { data, meta }
      logging.interceptor.ts
    filters/
      http-exception.filter.ts
    decorators/
      current-user.decorator.ts
      roles.decorator.ts
    pipes/
      validation.pipe.ts
  config/
    configuration.ts            # typed env config
    config.schema.ts            # validation schema (Zod)
```

### Per-module structure

Every module follows this exact layout — no exceptions:

```
modules/products/
  products.module.ts
  products.controller.ts        # HTTP layer: validate DTO, call service, return response
  products.service.ts           # business logic + orchestration
  products.repository.ts        # all DB queries (wraps Prisma)
  dto/
    create-product.dto.ts
    update-product.dto.ts
    product-query.dto.ts        # pagination/filter params
    product.response.ts         # outbound shape
  entities/
    product.entity.ts           # plain class matching the DB schema
  __tests__/
    products.service.spec.ts
    products.controller.spec.ts
```

### Data flow

```
HTTP Request
  → Controller        (parse & validate DTO via ValidationPipe)
  → Service           (business rules, transactions)
  → Repository        (DB queries via Prisma)
  → EventEmitter      (fire-and-forget side effects across modules)
HTTP Response
  → ResponseInterceptor (wraps in { data, meta?, message? })
```

### Cross-module communication

```
// GOOD — import the other module and use its exported service
@Module({ imports: [UsersModule] })
export class OrdersModule {}

// GOOD — decouple side effects with events
this.eventEmitter.emit('order.created', new OrderCreatedEvent(order));

// BAD — never import another module's repository directly
import { ProductsRepository } from '../products/products.repository'; // ✗
```

### Migration path to microservices
When a module needs to be extracted: replace `EventEmitter` calls with a message broker (NATS/Kafka/RabbitMQ) and the imported Service calls with an HTTP/gRPC client. The module code itself does not change.

---

## Recommended Libraries

Install these as you build each domain. All are NestJS-native or well-tested in NestJS.

### Core Infrastructure

| Purpose | Package(s) |
|---|---|
| Env config (typed) | `@nestjs/config` |
| Validation | `class-validator` `class-transformer` |
| Swagger / OpenAPI | `@nestjs/swagger` |
| Rate limiting | `@nestjs/throttler` |
| Health checks | `@nestjs/terminus` |
| Domain events | `@nestjs/event-emitter` |

```bash
npm i @nestjs/config class-validator class-transformer @nestjs/swagger @nestjs/throttler @nestjs/terminus @nestjs/event-emitter
```

### Database & ORM

Use **PostgreSQL** as the primary store and **Prisma v7** for type-safe queries.

| Purpose | Package(s) |
|---|---|
| ORM | `prisma` `@prisma/client` |
| PostgreSQL adapter (required in Prisma v7) | `@prisma/adapter-pg` `pg` `@types/pg` |

```bash
npm i prisma @prisma/client @prisma/adapter-pg pg
npm i -D @types/pg
npx prisma init
```

> **Prisma v7 note:** `PrismaClient` must be constructed with either an `adapter` or `accelerateUrl` — an empty `new PrismaClient()` throws. `PrismaService` injects `ConfigService` and passes `new PrismaPg({ connectionString })` as the adapter. The `prisma.config.ts` file is only used by the Prisma CLI (migrations, generate).

### Auth & Security

| Purpose | Package(s) |
|---|---|
| JWT | `@nestjs/jwt` `@nestjs/passport` `passport` `passport-jwt` |
| Password hashing | `bcrypt` `@types/bcrypt` |
| RBAC / CASL | `@casl/ability` `@casl/nestjs` |

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @casl/ability @casl/nestjs
npm i -D @types/bcrypt @types/passport-jwt
```

### Caching & Performance

| Purpose | Package(s) |
|---|---|
| Redis cache | `@nestjs/cache-manager` `cache-manager` `cache-manager-ioredis-yet` |
| Redis client | `ioredis` |

```bash
npm i @nestjs/cache-manager cache-manager ioredis cache-manager-ioredis-yet
```

### Background Jobs & Queues

Essential for order processing, notification dispatch, report generation.

| Purpose | Package(s) |
|---|---|
| Job queues (Redis-backed) | `@nestjs/bullmq` `bullmq` |
| Scheduled tasks | `@nestjs/schedule` |

```bash
npm i @nestjs/bullmq bullmq @nestjs/schedule
```

### Ecommerce-Specific

| Purpose | Package(s) |
|---|---|
| Payments (Stripe) | `stripe` |
| File uploads / S3 | `@aws-sdk/client-s3` `@aws-sdk/lib-storage` `multer` |
| Product search | `@elastic/elasticsearch` |
| Slugs | `slugify` |
| Currency math | `dinero.js` |
| Barcode / QR | `qrcode` `jsbarcode` |
| PDF receipts | `pdfkit` |

```bash
npm i stripe @aws-sdk/client-s3 @aws-sdk/lib-storage multer slugify dinero.js
npm i -D @types/multer
```

### HTTP & Integrations

| Purpose | Package(s) |
|---|---|
| Outbound HTTP | `@nestjs/axios` `axios` |
| WebSockets (real-time) | `@nestjs/websockets` `@nestjs/platform-socket.io` `socket.io` |
| Emails | `@nestjs-modules/mailer` `nodemailer` `handlebars` |

```bash
npm i @nestjs/axios axios @nestjs/websockets @nestjs/platform-socket.io socket.io
npm i @nestjs-modules/mailer nodemailer handlebars
```

### Observability

| Purpose | Package(s) |
|---|---|
| Structured logging | `nestjs-pino` `pino-http` `pino-pretty` |
| Tracing (OpenTelemetry) | `@opentelemetry/sdk-node` `@opentelemetry/auto-instrumentations-node` |

```bash
npm i nestjs-pino pino-http
npm i -D pino-pretty
```

---

## Conventions & Patterns

### Module Structure
Every module has the same 4 files + 2 folders. Keep it consistent so any developer can navigate any module instantly.
```
modules/products/
  products.module.ts
  products.controller.ts
  products.service.ts
  products.repository.ts
  dto/
    create-product.dto.ts
    update-product.dto.ts
    product-query.dto.ts
    product.response.ts
  entities/
    product.entity.ts
  __tests__/
    products.service.spec.ts
    products.controller.spec.ts
```

### DTOs

**Every field in every request DTO must have:**
- A `class-validator` decorator (`@IsString()`, `@IsNotEmpty()`, `@MinLength()`, `@IsEmail()`, etc.)
- An `@ApiProperty()` decorator with `example` and `description`

**Checklist before shipping a new endpoint:**
- [ ] All required fields have `@IsNotEmpty()` or equivalent
- [ ] String lengths validated (`@MinLength`, `@MaxLength`) where applicable
- [ ] Numeric ranges validated (`@Min`, `@Max`) where applicable
- [ ] Enum fields use `@IsEnum(MyEnum)`
- [ ] Optional fields marked `@IsOptional()` and still typed/validated
- [ ] `ValidationPipe` is globally enabled with `whitelist: true, forbidNonWhitelisted: true, transform: true`

Failing to validate means users get cryptic "Bad Request" instead of knowing what to fix.

### Response Shape

**Success responses** — wrapped by `ResponseInterceptor`:
```ts
{ data: T, meta?: PaginationMeta, message?: string }
```

**Validation error responses** (400) — from `AllExceptionsFilter`:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "constraint": "minLength", "params": { "min": 6 }, "message": "password must be longer than or equal to 6 characters" }
  ]
}
```

**Business error responses** (4xx) — thrown by services:
```json
{
  "statusCode": 409,
  "message": "Phone number already registered",
  "code": "PHONE_ALREADY_EXISTS"
}
```

The `code` field is a machine-readable key the frontend uses for i18n translation.

### Error Handling

**Services must throw NestJS HTTP exceptions — never raw `Error`:**
```ts
// GOOD
throw new ConflictException({ message: 'Phone already registered', code: 'PHONE_ALREADY_EXISTS' });
throw new NotFoundException({ message: 'User not found', code: 'USER_NOT_FOUND' });
throw new UnauthorizedException({ message: 'Invalid OTP', code: 'OTP_INVALID' });

// BAD — loses HTTP status code, leaks stack trace
throw new Error('Phone already registered');
```

**i18n strategy:** The API returns English messages + a `code` key. The miniapp uses its own i18n to translate by `code`. Do **not** add `nestjs-i18n` to the backend unless the server needs to generate translated content (emails, SMS). See i18n decision in `openspec/specs/` if archived.

**`AllExceptionsFilter`** catches all exceptions and:
- Surfaces `exception.getResponse()` for `HttpException` (includes field-level validation errors)
- Returns `500` + logs stack trace for unexpected errors
- Never leaks internal stack traces to clients

### Auth

See `src/modules/auth/CLAUDE.md` for the full authentication flow (OTP, registration, token lifecycle, dev overrides, SMS integration point).

Quick reference for consuming modules:
- Protect routes: `@UseGuards(JwtAuthGuard)`
- Get current user: `@CurrentUser() user: User`
- RBAC: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`
- Roles: `admin`, `staff`, `customer`
- JWT payload: `{ sub: userId, phone, role }` — access via `@CurrentUser()`, not raw payload

### Rate Limiting

`ThrottlerGuard` is registered globally via `APP_GUARD` in `AppModule`. Every route is covered automatically with no per-controller work.

- **Default:** 100 req / 60s per IP, configurable via `THROTTLE_LIMIT` / `THROTTLE_TTL` env vars
- **Per-route override:** Use `@Throttle({ default: { limit, ttl } })` on a controller method to override for that route
- **Opt out:** Use `@SkipThrottle()` on health check routes or other high-frequency internal calls
- **New modules get rate limiting for free** — no extra code needed

Auth endpoints have stricter overrides (see `src/modules/auth/CLAUDE.md`).

### Pagination
All list endpoints must support cursor or offset pagination via query params:
```
GET /products?page=1&limit=20&sort=createdAt:desc
```

### Environment Variables
Use `@nestjs/config` with a typed `ConfigService`. Validated at startup via Zod in `src/config/config.schema.ts` — app refuses to start if any required var is missing or invalid.

```
PORT=4000
DATABASE_URL=postgresql://nretail:nretail@localhost:5434/nretail
REDIS_URL=redis://localhost:6379
JWT_SECRET=<min 16 chars>
JWT_EXPIRES_IN=7d
```

---

## Domain Modules Roadmap

1. **Auth** — register, login, refresh token, logout, OAuth (Google/Facebook)
2. **Users** — profile, addresses, preferences
3. **Catalog** — products, categories, tags, brands, variants (size/color/etc.), inventory
4. **Pricing** — price rules, discounts, coupons, flash sales
5. **Cart & Orders** — add to cart, checkout, order states (pending → confirmed → shipped → delivered → returned)
6. **Payments** — Stripe integration, webhook handlers, refunds
7. **Shipping** — carrier integration, delivery slots, tracking
8. **Reviews** — product ratings and comments, moderation
9. **Notifications** — email, SMS, in-app (via WebSocket / push)
10. **Search** — full-text product search, filters, autocomplete (Elasticsearch)
11. **Analytics** — sales reports, inventory alerts (background jobs)
12. **Admin** — back-office CRUD, role management

---

## Key Design Decisions

- **PostgreSQL** is the source of truth; **Redis** for cache + queues.
- **Prisma** preferred over TypeORM for better type safety with complex queries.
- **BullMQ** over Bull — native TypeScript, better reliability.
- **Elasticsearch** (`@elastic/elasticsearch`) for product search — full-text, filters, autocomplete.
- **Stripe** as the primary payment processor — handle webhooks in a dedicated controller.
- Use **optimistic concurrency** for inventory deductions (prevent overselling).
- All money values stored as integers (smallest currency unit, e.g. cents) — use `dinero.js` for display.
