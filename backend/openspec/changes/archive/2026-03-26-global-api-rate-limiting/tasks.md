## 1. AppModule — global throttler setup

- [x] 1.1 Add `ThrottlerModule.forRootAsync` to `AppModule` imports, reading `THROTTLE_LIMIT` (default 100) and `THROTTLE_TTL` (default 60) from `ConfigService` (TTL in milliseconds)
- [x] 1.2 Add `{ provide: APP_GUARD, useClass: ThrottlerGuard }` to `AppModule` providers

## 2. AuthModule cleanup

- [x] 2.1 Remove `ThrottlerModule` import from `AuthModule`
- [x] 2.2 Remove `@UseGuards(ThrottlerGuard)` from `login`, `otpRegister`, and `otpForgotPassword` methods in `AuthController` (keep existing `@Throttle` overrides)

## 3. Environment variables

- [x] 3.1 Update `.env.example` — replace auth-specific comment block with `THROTTLE_LIMIT=100` and `THROTTLE_TTL=60` global vars

## 4. Test updates

- [x] 4.1 Update `auth.controller.spec.ts` — replace `overrideGuard(ThrottlerGuard)` with `ThrottlerModule.forRoot([{ limit: 999, ttl: 1 }])` in the test module
- [x] 4.2 Verify `auth.e2e-spec.ts` already imports `ThrottlerModule` for rate-limit tests (add if missing)

## 5. Verification

- [x] 5.1 Run `npm run test` — all unit tests pass
- [x] 5.2 Run `npm run test:e2e` — all e2e tests pass
- [x] 5.3 Run `npm run lint` — no lint errors
