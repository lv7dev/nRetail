# Health Module — CLAUDE.md

## Purpose

Liveness endpoint. Reports whether the application and its database connection are healthy. Used by load balancers, Kubernetes probes, and uptime monitors.

---

## Endpoint

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Returns 200 (ok) or 503 (db unreachable) |

Rate limiting is disabled on this route via `@SkipThrottle()` — probes hit it frequently.

---

## Response Format

Terminus standard format. Consumers should check the HTTP status code, not the body.

**200 — healthy:**
```json
{
  "status": "ok",
  "info": { "database": { "status": "up" } },
  "error": {},
  "details": { "database": { "status": "up" } }
}
```

**503 — database unreachable:**
```json
{
  "status": "error",
  "info": {},
  "error": { "database": { "status": "down", "message": "connection refused" } },
  "details": { "database": { "status": "down", "message": "connection refused" } }
}
```

---

## Architecture

This module uses `@nestjs/terminus` instead of the standard service/repository pattern.

```
HealthModule
  imports: TerminusModule          ← provides HealthCheckService
  providers: DatabaseHealthIndicator
  controllers: HealthController
```

**`health.service.ts` — `DatabaseHealthIndicator`**

Despite the filename, this is a terminus `HealthIndicator`, not a service. It:
- Extends `HealthIndicator` from `@nestjs/terminus`
- Runs `SELECT 1` via `PrismaService.$queryRaw`
- Returns `{ database: { status: 'up' } }` on success
- Throws `HealthCheckError` with down status on failure

`PrismaService` is injected from the global `DatabaseModule` — no explicit import needed.

**`health.controller.ts` — `HealthController`**

- Injects `HealthCheckService` (from `TerminusModule`) and `DatabaseHealthIndicator`
- `@HealthCheck()` decorator marks the endpoint for terminus routing
- Returns `Promise<HealthCheckResult>` — terminus sets 200/503 automatically
- **Never uses `@Res()`** — see TypeScript pitfall below

---

## TypeScript Pitfall — Never Use `@Res()` Here

`@Res() res: Response` in a decorated method signature triggers **TS1272** under our tsconfig (`isolatedModules: true` + `emitDecoratorMetadata: true`). The `Response` type from `express` in a `@Decorated()` parameter forces TypeScript to emit it in `__metadata`, but `isolatedModules` can't guarantee the import is a runtime value.

Terminus eliminates the need for `@Res()` entirely — `HealthCheckService.check()` handles the 503 response by throwing `HealthCheckError` (which extends `HttpException(503)`).

If you ever need to use an express type in a decorated parameter elsewhere, use `import type { Response } from 'express'` — this tells TypeScript to emit `Object` in metadata instead of the class reference.

---

## Adding More Health Checks

To check Redis, an external service, or any other dependency alongside the DB:

```ts
// In health.controller.ts
check(): Promise<HealthCheckResult> {
  return this.health.check([
    () => this.db.isHealthy('database'),
    () => this.redis.isHealthy('redis'),   // add new indicator
  ]);
}
```

Create a new indicator class extending `HealthIndicator`, register it as a provider in `HealthModule`, and inject it into `HealthController`.

---

## Module Dependencies

```
HealthModule
  imports: TerminusModule
  providers: DatabaseHealthIndicator
  controllers: HealthController

DatabaseModule is @Global() — PrismaService is available without importing it here.
```

---

## Testing

Unit tests in `__tests__/`:

- `health.service.spec.ts` — tests `DatabaseHealthIndicator.isHealthy()`:
  - Returns `{ database: { status: 'up' } }` when query succeeds
  - Throws `HealthCheckError` when query throws an `Error`
  - Includes the error message in `HealthCheckError.causes`
  - Coerces non-Error thrown values to string

- `health.controller.spec.ts` — tests `HealthController.check()`:
  - Returns the `HealthCheckResult` from `HealthCheckService.check()`
  - Calls `db.isHealthy('database')` via the indicator function

Both test files instantiate classes directly (`new DatabaseHealthIndicator(mockPrisma)`) rather than using `Test.createTestingModule()` — simpler and sufficient for pure unit tests.
