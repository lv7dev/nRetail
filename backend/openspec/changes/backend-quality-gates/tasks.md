## 1. Jest Coverage Configuration

- [x] 1.1 Add `coveragePathIgnorePatterns` to Jest config in `package.json` to exclude `main.ts`, `*.module.ts`, `config/config.schema.ts`, `config/configuration.ts`
- [x] 1.2 Set initial `coverageThreshold` to `{ global: { statements: 80, branches: 80, functions: 80, lines: 80 } }`
- [x] 1.3 Verify `npm run test:cov` excludes boilerplate files and passes at current coverage

## 2. Unit Tests — Shared Infrastructure (EASY)

- [x] 2.1 Write `src/shared/interceptors/__tests__/response.interceptor.spec.ts` — test that handler result is wrapped in `{ data: T }`
- [x] 2.2 Write `src/shared/interceptors/__tests__/logging.interceptor.spec.ts` — test that `next.handle()` is called and request/response is logged
- [x] 2.3 Write `src/shared/guards/__tests__/roles.guard.spec.ts` — test `canActivate()` returns true when roles match, false when they don't
- [x] 2.4 Write `src/shared/decorators/__tests__/current-user.decorator.spec.ts` — test that `ExecutionContext` user extraction works
- [x] 2.5 Write `src/shared/decorators/__tests__/roles.decorator.spec.ts` — test that `SetMetadata` is invoked with `ROLES_KEY` and supplied roles

## 3. Unit Tests — Auth Repositories (MEDIUM)

- [x] 3.1 Write `src/modules/auth/__tests__/otp.repository.spec.ts` — mock PrismaService, test `create`, `findByPhone`, `delete` methods
- [x] 3.2 Write `src/modules/auth/__tests__/phone-config.repository.spec.ts` — mock PrismaService, test `findByPhone` method

## 4. Unit Tests — JWT Strategy (MEDIUM)

- [x] 4.1 Write `src/modules/auth/__tests__/jwt.strategy.spec.ts` — test `validate()` returns the user payload from the JWT

## 5. Unit Tests — Users Module (EASY)

- [x] 5.1 Write `src/modules/users/__tests__/users.repository.spec.ts` — mock PrismaService, test `findById`, `findByPhone`, `create`, `updatePassword` methods
- [x] 5.2 Write `src/modules/users/__tests__/users.controller.spec.ts` — mock UsersService, test controller routes

## 6. Unit Tests — Database (MEDIUM)

- [x] 6.1 Write `src/shared/database/__tests__/prisma.service.spec.ts` — test `onModuleInit` calls `$connect`, `onModuleDestroy` calls `$disconnect`

## 7. Health Check Endpoint

- [x] 7.1 Create `src/modules/health/health.module.ts` — imports PrismaModule, registers HealthController and HealthService
- [x] 7.2 Create `src/modules/health/health.service.ts` — `check()` runs `prisma.$queryRaw\`SELECT 1\``, returns `{ db: 'ok' }` or catches and returns `{ db: 'error', error: message }`
- [x] 7.3 Create `src/modules/health/health.controller.ts` — `GET /health`, decorated `@Public()`, calls `healthService.check()`, returns 200 or 503
- [x] 7.4 Register `HealthModule` in `app.module.ts`
- [x] 7.5 Write `src/modules/health/__tests__/health.service.spec.ts` — test ok path and error path with mocked PrismaService
- [x] 7.6 Write `src/modules/health/__tests__/health.controller.spec.ts` — test 200 and 503 responses

## 8. Coverage Threshold Tighten

- [x] 8.1 Run `npm run test:cov` after all tests pass and confirm coverage is at or near 100% (excluding boilerplate)
- [x] 8.2 Raise `coverageThreshold` to `{ global: { statements: 98, branches: 80, functions: 98, lines: 99 } }` (achieved level — branches capped at ~80% due to NestJS decorator metadata artifacts in Istanbul)
- [x] 8.3 Run `npm run lint` and fix any TypeScript/ESLint errors in new test files
