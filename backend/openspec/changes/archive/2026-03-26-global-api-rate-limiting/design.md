## Context

`ThrottlerModule` is currently registered in `AuthModule` with a single unnamed throttler driven by `THROTTLE_AUTH_LIMIT`/`THROTTLE_AUTH_TTL` env vars. Auth controller methods use `@UseGuards(ThrottlerGuard)` individually. No other module has any rate limiting. As the API grows, this requires remembering to add throttling to each new controller.

The target state: one `ThrottlerModule` in `AppModule`, registered globally via `APP_GUARD`, so every route is covered by default with zero per-controller work.

## Goals / Non-Goals

**Goals:**
- Single source of truth for rate limiting configuration in `AppModule`
- All API endpoints protected by default at 100 req/60s
- Auth endpoints retain their stricter per-route overrides (login: 10/60s, OTP: 6/300s)
- New modules get rate limiting for free with no extra code

**Non-Goals:**
- Per-user rate limiting (current is per-IP only)
- Redis-backed distributed throttle storage (in-memory is sufficient for single instance)
- Rate limiting on WebSocket connections

## Decisions

### D1 — Register ThrottlerGuard as APP_GUARD in AppModule

**Decision:** Provide `{ provide: APP_GUARD, useClass: ThrottlerGuard }` in `AppModule.providers`. This makes the guard apply to every route globally.

**Why:** Eliminates per-controller `@UseGuards(ThrottlerGuard)`. New modules/controllers are covered automatically. Per-route `@Throttle` overrides still work exactly as before, and `@SkipThrottle()` can be used to opt out where needed (e.g. health check endpoints).

**Alternative considered:** Keep `@UseGuards` per-controller. Rejected — easy to forget, creates inconsistent protection as the API grows.

### D2 — Default: 100 req / 60s, configurable via env vars

**Decision:** `ThrottlerModule.forRootAsync` reads `THROTTLE_LIMIT` (default: 100) and `THROTTLE_TTL` (default: 60) from `ConfigService`.

**Why:** 100/60s is generous enough for real users hitting catalog/product/order endpoints, tight enough to deter automated scraping. Env vars allow tuning per environment (staging can be stricter, dev can be relaxed).

### D3 — Auth per-route overrides stay as @Throttle decorators

**Decision:** Keep `@Throttle({ default: { limit: 10, ttl: 60_000 } })` on login and `@Throttle({ default: { limit: 6, ttl: 300_000 } })` on OTP endpoints. Remove `@UseGuards(ThrottlerGuard)` since the global guard covers it.

**Why:** `@Throttle` overrides work with a global guard — no change in behavior, just less boilerplate.

### D4 — Test modules use ThrottlerModule.forRoot directly

**Decision:** Unit tests (`auth.controller.spec.ts`) add `ThrottlerModule.forRoot([{ limit: 999, ttl: 1 }])` rather than overriding the guard. E2e tests (`auth.e2e-spec.ts`) already import `ThrottlerModule`.

**Why:** Tests the real guard path. The override approach (`overrideGuard`) was only needed because the guard wasn't available — with `ThrottlerModule` imported, it works correctly. A very high limit (999) means tests won't hit the limit accidentally.

## Risks / Trade-offs

- **`@SkipThrottle()` needed for health checks** — if a health check endpoint is hit by a load balancer every few seconds, it could exhaust the throttle. Add `@SkipThrottle()` to health check routes when they're added.
- **In-memory storage is per-instance** — if the app runs on multiple instances, each has its own counter. A user could make 100 × N requests across N instances. Acceptable at current scale; upgrade to Redis storage when horizontal scaling is needed.
- **Existing test that overrides ThrottlerGuard** — `auth.controller.spec.ts` currently uses `overrideGuard(ThrottlerGuard)`. This needs to change to importing `ThrottlerModule` directly.

## Migration Plan

1. Add `ThrottlerModule.forRootAsync` + `APP_GUARD` to `AppModule`
2. Remove `ThrottlerModule` from `AuthModule`
3. Remove `@UseGuards(ThrottlerGuard)` from `AuthController` methods (keep `@Throttle` overrides)
4. Update `auth.controller.spec.ts` — replace `overrideGuard` with `ThrottlerModule.forRoot`
5. Update `.env.example` — replace auth-specific vars with global ones
6. Run all tests to verify

## Open Questions

- Should `GET /auth/me` and `POST /auth/refresh` be explicitly skipped (`@SkipThrottle`) since they require a valid JWT? Currently they'd consume the global 100/60s counter, which is fine but arguably wasteful for authenticated users.
