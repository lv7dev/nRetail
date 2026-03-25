## 1. Dependencies

- [x] 1.1 Install core infrastructure: `@nestjs/config class-validator class-transformer @nestjs/swagger @nestjs/throttler @nestjs/terminus @nestjs/event-emitter`
- [x] 1.2 Install database: `prisma @prisma/client`
- [x] 1.3 Install logging: `nestjs-pino pino-http` + devDep `pino-pretty`
- [x] 1.4 Install Zod (config validation): `zod`
- [x] 1.5 Run `npx prisma init` to generate `prisma/schema.prisma`

## 2. Config

- [x] 2.1 Create `src/config/config.schema.ts` — Zod schema validating `PORT`, `NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- [x] 2.2 Create `src/config/configuration.ts` — factory function that parses `process.env` through the schema and returns a typed config object
- [x] 2.3 Register `ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate })` in `app.module.ts`
- [x] 2.4 Add `.env.example` listing all required variables with placeholder values

## 3. Database

- [x] 3.1 Create `src/shared/database/prisma.service.ts` — extends `PrismaClient`, implements `OnModuleInit` / `OnModuleDestroy`
- [x] 3.2 Create `src/shared/database/prisma.module.ts` — `@Global()` module that exports `PrismaService`
- [x] 3.3 Import `DatabaseModule` in `app.module.ts`
- [x] 3.4 Verify `npx prisma generate` succeeds with the initial empty schema

## 4. Shared Infrastructure

- [x] 4.1 Create `src/shared/interceptors/response.interceptor.ts` — wraps controller return values in `{ data, meta?, message? }`
- [x] 4.2 Create `src/shared/interceptors/logging.interceptor.ts` — logs method, path, status, duration via pino
- [x] 4.3 Create `src/shared/filters/http-exception.filter.ts` — catches all exceptions, returns `{ statusCode, message, timestamp, path }`
- [x] 4.4 Create `src/shared/guards/jwt-auth.guard.ts` — stub that returns `true`
- [x] 4.5 Create `src/shared/guards/roles.guard.ts` — stub that returns `true`
- [x] 4.6 Create `src/shared/decorators/current-user.decorator.ts` — placeholder `@CurrentUser()` param decorator
- [x] 4.7 Create `src/shared/decorators/roles.decorator.ts` — `@Roles(...roles)` metadata decorator
- [x] 4.8 Create `src/shared/pipes/validation.pipe.ts` — re-exports `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`

## 5. Bootstrap (`main.ts`)

- [x] 5.1 Register `LoggerModule.forRoot()` (nestjs-pino) and use `app.useLogger()`
- [x] 5.2 Register global `ValidationPipe` via `app.useGlobalPipes()`
- [x] 5.3 Register global `ResponseInterceptor` via `app.useGlobalInterceptors()`
- [x] 5.4 Register global `LoggingInterceptor` via `app.useGlobalInterceptors()`
- [x] 5.5 Register global `AllExceptionsFilter` via `app.useGlobalFilters()`
- [x] 5.6 Enable CORS via `app.enableCors()`
- [x] 5.7 Mount Swagger at `/api/docs` when `NODE_ENV !== 'production'`
- [x] 5.8 Read port from `ConfigService` (default `3000`)

## 6. AppModule

- [x] 6.1 Remove default `AppController` and `AppService` imports from `app.module.ts`
- [x] 6.2 Import `ConfigModule`, `DatabaseModule`, `EventEmitterModule.forRoot()`

## 7. Module Stubs

- [x] 7.1 Create `src/modules/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts` — empty stubs
- [x] 7.2 Create `src/modules/users/users.module.ts`, `users.controller.ts`, `users.service.ts` — empty stubs
- [x] 7.3 Import `AuthModule` and `UsersModule` in `app.module.ts`
- [x] 7.4 Delete `src/app.controller.ts`, `src/app.controller.spec.ts`, `src/app.service.ts`

## 8. Verification

- [x] 8.1 Run `npm run build` — TypeScript compiles without errors
- [x] 8.2 Run `npm run start:dev` — app starts, logs a pino JSON line, Swagger accessible at `/api/docs`
- [x] 8.3 Send `GET /` — receive a 404 with the standard error shape (not the default NestJS HTML)
- [x] 8.4 Run `npm run test` — existing Jest setup passes (no regressions)
- [x] 8.5 Run `npm run lint` — no ESLint errors
