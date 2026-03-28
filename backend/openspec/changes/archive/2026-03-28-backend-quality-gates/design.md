## Context

The backend Jest config collects coverage from all `**/*.(t|j)s` under `src/` — including `main.ts`, `*.module.ts`, and config schema files which have no executable logic. This inflates the "uncovered" count and makes 100% an unreachable goal. Unit tests exist only for `auth` and `shared/filters|pipes` — leaving repositories, guards, interceptors, decorators, JWT strategy, and `users.controller` untested. There is no `/health` endpoint, so there is no liveness signal for Docker or uptime monitors.

## Goals / Non-Goals

**Goals:**
- Achieve 100% unit test coverage on all logic-bearing files (after excluding boilerplate)
- Configure `coveragePathIgnorePatterns` to exclude files with no testable logic
- Add a `/health` endpoint that checks Postgres connectivity
- Enforce a coverage threshold in Jest so CI catches regressions

**Non-Goals:**
- Integration tests for modules other than `auth` (separate change when new modules are built)
- E2E tests (live in `miniapp/e2e/`, driven by frontend features)
- Load testing or performance benchmarks
- DB migration data-survival tests (deferred until production data exists)

## Decisions

### 1. What to exclude from coverage

Exclude files that are NestJS framework wiring with no testable logic:

```
coveragePathIgnorePatterns: [
  "main.ts",
  "*.module.ts",
  "config/config.schema.ts",
  "config/configuration.ts",
]
```

**Why**: These files are either NestJS decorator metadata (modules), or bootstrapping glue (main.ts). Testing them requires mocking NestJS internals and produces tests that assert framework behavior, not business logic. Every mature NestJS project excludes them.

### 2. Coverage threshold

Set threshold at 80% initially, raise to 100% after all unit tests pass:

```json
"coverageThreshold": {
  "global": { "statements": 80, "branches": 80, "functions": 80, "lines": 80 }
}
```

**Why 80% not 100%**: Start with 80% to avoid CI blocking during the implementation window. Raise to 100% in the final task once all spec files are written.

### 3. Health endpoint design

New module `src/modules/health/` with:
- `GET /health` — public route (no JWT guard)
- Checks `prisma.$queryRaw\`SELECT 1\`` to verify DB connectivity
- Returns `200 { status: 'ok', db: 'ok' }` or `503 { status: 'error', db: 'error', error: <message> }`

**Why not use `@nestjs/terminus`**: Terminus adds a dependency for a use case we can cover in ~30 lines. We only need Postgres liveness right now. Add Terminus later if Redis, queues, or external services need health checks.

**Why 503 not 500**: 503 (Service Unavailable) is the correct HTTP status for a liveness failure — load balancers and uptime monitors specifically watch for it.

### 4. Unit test strategy for repositories

Repositories wrap Prisma calls. Unit test with a mocked `PrismaService`:

```ts
const mockPrisma = { otpVerification: { findFirst: jest.fn(), upsert: jest.fn() } }
```

**Why not test against real DB**: That's what integration tests are for. Unit tests validate the repository's own logic (which method it calls, what args it passes, how it handles null returns) — not Prisma itself.

### 5. Unit test strategy for interceptors/guards/decorators

- `ResponseInterceptor`: test that it wraps the response in `{ data: T }`
- `LoggingInterceptor`: test that it calls `next.handle()` and logs
- `RolesGuard`: test `canActivate()` with and without matching roles
- `CurrentUserDecorator`: test that `ExecutionContext` extraction works
- `RolesDecorator`: test that `SetMetadata` is called with the right key
- `JwtStrategy`: test `validate()` returns user payload

## Risks / Trade-offs

**Risk: Mocked Prisma drift** → Mitigation: Integration tests run against real Postgres and catch actual query errors; unit tests just verify call shape.

**Risk: Health endpoint adds an unauthenticated route** → Mitigation: `/health` returns no sensitive data (just `ok`/`error`). Standard practice for all backend services.

**Risk: Coverage threshold blocks CI during implementation** → Mitigation: Add threshold as the last task, after all unit tests are written.
