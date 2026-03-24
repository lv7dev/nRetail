## Why

The backend is currently a bare NestJS scaffold (default `app.module.ts`, `app.controller.ts`, `app.service.ts`). Before building any retail features, the foundational structure — typed config, shared infrastructure (guards, interceptors, filters, pipes), database connection, and module scaffolding — needs to be established so all future domain modules have a consistent, scalable base to build on.

## What Changes

- Replace the default app controller/service with the real module skeleton
- Add typed environment config with Zod validation (`src/config/`)
- Add shared infrastructure (`src/shared/`): Prisma, Redis, guards, interceptors, filters, decorators, pipes
- Bootstrap global pipes, interceptors, and filters in `main.ts`
- Install and configure all core infrastructure dependencies
- Scaffold the first two domain modules as empty stubs: `auth` and `users`

## Capabilities

### New Capabilities

- `config`: Typed, validated environment configuration using `@nestjs/config` + Zod — all env vars are validated at startup
- `database`: Prisma service connected to PostgreSQL, available across all modules via `DatabaseModule`
- `shared-infrastructure`: Global request pipeline — `ValidationPipe`, `ResponseInterceptor` (wraps responses in `{ data, meta?, message? }`), `AllExceptionsFilter`, `LoggingInterceptor`

### Modified Capabilities

<!-- None — no existing specs to update -->

## Impact

- `backend/src/` folder structure (new directories: `config/`, `shared/`, `modules/`)
- `backend/src/main.ts` — updated to register global pipes, interceptors, filters, Swagger, and CORS
- `backend/src/app.module.ts` — updated to import `ConfigModule`, `DatabaseModule`, `CacheModule`, `EventEmitterModule`
- `backend/package.json` — new core dependencies installed
- No external APIs or deployments affected (foundational scaffolding only)
