## Context

The project is a NestJS 11 + TypeScript 5 + Node 22 backend for nRetail. The current codebase is the default NestJS CLI scaffold — a single module with a hello-world controller. Before any domain feature work, the project needs: typed config, a database connection, a shared infrastructure layer (request pipeline), and a clean module structure to build on.

Key constraints:
- PostgreSQL as the primary store; Prisma as the ORM
- Redis for caching and queues (BullMQ)
- Jest is already configured — keep it
- All money values stored as integers (cents); use `dinero.js` for display
- Modules must never import each other's repositories — only exported Services

## Goals / Non-Goals

**Goals:**
- Establish typed, Zod-validated env config that fails fast at startup if required vars are missing
- Wire Prisma to PostgreSQL and expose it via a shared `DatabaseModule`
- Set up the global request pipeline: `ValidationPipe`, `ResponseInterceptor`, `AllExceptionsFilter`, `LoggingInterceptor`
- Configure Swagger/OpenAPI at `/api/docs`
- Scaffold `src/modules/auth/` and `src/modules/users/` as empty stubs (module + controller + service files only)
- Install all core infrastructure dependencies

**Non-Goals:**
- Implementing any auth logic, user CRUD, or domain features (future changes)
- Prisma schema design beyond the initial `prisma init` (future changes)
- Redis/BullMQ queue setup (future changes)
- Elasticsearch, Stripe, S3, or any ecommerce-specific integrations (future changes)

## Decisions

### Config: `@nestjs/config` + Zod schema, fail fast

**Decision**: Use `@nestjs/config` with `isGlobal: true`. Define a Zod schema in `src/config/config.schema.ts` that validates all required env vars at startup. Export a typed `configuration()` factory from `src/config/configuration.ts`.

**Why**: TypeScript types alone don't catch missing env vars at runtime. Zod validation in the config factory throws immediately on startup if the environment is misconfigured — no silent failures in production.

---

### Database: Prisma over TypeORM

**Decision**: Use `prisma` + `@prisma/client`. Create a `PrismaService` that extends `PrismaClient` and implements `OnModuleInit`/`OnModuleDestroy`. Export it from `src/shared/database/`.

**Why**: Prisma's generated client gives better TypeScript inference for complex queries than TypeORM's decorator-based approach. The generated types match the schema exactly, which eliminates a whole class of runtime errors.

---

### Global pipeline

**Decision**: Register globally in `main.ts`:
1. `ValidationPipe` — `whitelist: true, forbidNonWhitelisted: true, transform: true`
2. `ResponseInterceptor` — wraps all responses in `{ data, meta?, message? }`
3. `AllExceptionsFilter` — catches and formats all unhandled errors
4. `LoggingInterceptor` — logs method, path, status, and duration for every request

**Why**: Registering globally ensures every endpoint gets validation, consistent response shape, and structured logs without opt-in decorators per controller.

---

### Logging: `nestjs-pino`

**Decision**: Replace the default NestJS logger with `nestjs-pino` + `pino-http`. Use `pino-pretty` in development.

**Why**: Structured JSON logs are essential for production observability (log aggregators, alerting). Pino is the fastest Node.js logger and integrates cleanly with NestJS via `LoggerModule.forRoot()`.

---

### Swagger: enabled in development only

**Decision**: Mount Swagger at `/api/docs`, enabled only when `NODE_ENV !== 'production'`. All DTOs use `@ApiProperty()`.

**Why**: Swagger in production is a security surface — it exposes the full API contract publicly. Gating it to non-production keeps it useful for dev/staging without the risk.

---

### Folder structure

```
src/
├── main.ts                          # global pipes, interceptors, filters, Swagger, pino
├── app.module.ts                    # imports ConfigModule, DatabaseModule, EventEmitterModule
├── config/
│   ├── configuration.ts             # typed config factory
│   └── config.schema.ts             # Zod validation schema
├── shared/
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts         # exports PrismaService
│   ├── cache/
│   │   └── redis.module.ts          # placeholder — wired in a future change
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # placeholder
│   │   └── roles.guard.ts           # placeholder
│   ├── interceptors/
│   │   ├── response.interceptor.ts  # wraps { data, meta?, message? }
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts # placeholder
│   │   └── roles.decorator.ts        # placeholder
│   └── pipes/
│       └── validation.pipe.ts        # re-exports configured ValidationPipe
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts        # stub
│   │   └── auth.service.ts           # stub
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts       # stub
│       └── users.service.ts          # stub
└── prisma/
    └── schema.prisma                 # initialized by `prisma init`
```

## Risks / Trade-offs

- **Prisma schema is empty** — `PrismaService` will connect but no models exist yet. Mitigation: The service handles connection errors gracefully; models are added in domain-specific changes.
- **Guards are stubs** — `JwtAuthGuard` and `RolesGuard` are created as placeholders that pass through (no actual auth). Mitigation: clearly commented as stubs; auth is implemented in the `auth` module change.
- **ResponseInterceptor wraps all responses** — including error responses shaped by the filter. Mitigation: The filter sends its own structure directly using `response.json()`, bypassing the interceptor.
