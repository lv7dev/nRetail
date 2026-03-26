## Why

Rate limiting is currently only configured inside `AuthModule`, leaving all other API endpoints (catalog, orders, users, etc.) completely unprotected. As new modules are added, each would need to manually wire `ThrottlerModule` — this approach doesn't scale and is easy to forget.

## What Changes

- Move `ThrottlerModule` from `AuthModule` to `AppModule` with `isGlobal: true` and a sensible default (100 req/60s)
- Register `ThrottlerGuard` as a global `APP_GUARD` so every route is protected automatically with no per-controller wiring
- Remove `ThrottlerModule` from `AuthModule` (no longer needed there)
- Remove `@UseGuards(ThrottlerGuard)` from individual auth controller methods (covered globally)
- Keep per-route `@Throttle` overrides on auth endpoints: login (10/60s), OTP (6/300s)
- Update `.env.example` with global throttle env vars (`THROTTLE_LIMIT`, `THROTTLE_TTL`)
- Remove now-redundant `THROTTLE_AUTH_LIMIT` / `THROTTLE_AUTH_TTL` env vars

## Capabilities

### New Capabilities

- `global-api-rate-limiting`: A default rate limit applied to every API endpoint in the project automatically, with per-route override support

### Modified Capabilities

- `auth-rate-limiting`: Auth endpoints now inherit the global guard; per-route `@Throttle` overrides remain but `@UseGuards(ThrottlerGuard)` is removed. OTP limit changes to 6/300s (was 10/60s). Env var names change.

## Impact

- `AppModule`: adds `ThrottlerModule.forRootAsync` + `APP_GUARD` provider
- `AuthModule`: removes `ThrottlerModule` import
- `AuthController`: removes `@UseGuards(ThrottlerGuard)` from login, otp/register, otp/forgot-password; retains `@Throttle` overrides
- `auth.controller.spec.ts`: remove `overrideGuard(ThrottlerGuard)` — guard is now global, test module needs `ThrottlerModule`
- `test/auth.e2e-spec.ts`: add `ThrottlerModule` to both test app setups (already done for rate-limit test)
- `.env.example`: replace auth-specific throttle vars with global ones
- No breaking changes to any API response shape
