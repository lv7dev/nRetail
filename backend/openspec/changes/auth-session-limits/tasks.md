## 1. Database Migration

- [x] 1.1 Add `tokenPrefix String @default("")` column to `RefreshToken` model in `prisma/schema.prisma`
- [x] 1.2 Generate and run Prisma migration (`npx prisma migrate dev --name add-refresh-token-prefix`)

## 2. RefreshTokenRepository

- [x] 2.1 Write failing tests for `create()` — assert returned raw token starts with the stored `tokenPrefix` (first 8 chars)
- [x] 2.2 Update `create()` to extract `tokenPrefix` from `rawToken` and store it alongside `tokenHash`
- [x] 2.3 Write failing tests for `findAndDelete()` — assert it uses prefix lookup and handles prefix collision
- [x] 2.4 Rewrite `findAndDelete()` to query `WHERE tokenPrefix = :prefix AND expiresAt > now()`, bcrypt-compare only the matched row(s)
- [x] 2.5 Write failing tests for `deleteExpiredByUserId(userId)` — new method, deletes all rows where `userId = :id AND expiresAt < now()`
- [x] 2.6 Add `deleteExpiredByUserId(userId)` method to the repository
- [x] 2.7 Write failing tests for `countActiveByUserId(userId)` — returns count of non-expired rows for a user
- [x] 2.8 Add `countActiveByUserId(userId)` method to the repository
- [x] 2.9 Write failing tests for `deleteOldestByUserId(userId)` — deletes the single row with the earliest `expiresAt` for the user
- [x] 2.10 Add `deleteOldestByUserId(userId)` method to the repository

## 3. AuthService — Token Cap + Lazy Cleanup

- [x] 3.1 Write failing unit test: `issueTokens` with 3 active tokens → no eviction, count stays 4
- [x] 3.2 Write failing unit test: `issueTokens` with 5 active tokens → oldest evicted, count stays 5
- [x] 3.3 Write failing unit test: `issueTokens` with 5 expired + 0 active tokens → expired cleaned, new token created (total: 1)
- [x] 3.4 Update `issueTokens()` in `AuthService` to: (1) call `deleteExpiredByUserId`, (2) check count, (3) evict oldest if count >= 5, (4) create new token

## 4. Rate Limiting Setup

- [x] 4.1 Install `@nestjs/throttler` (`npm i @nestjs/throttler`)
- [x] 4.2 Register `ThrottlerModule.forRootAsync` in `AuthModule` reading `THROTTLE_AUTH_LIMIT` and `THROTTLE_AUTH_TTL` from `ConfigService` (defaults: limit=10, ttl=60)
- [x] 4.3 Add `THROTTLE_AUTH_LIMIT` and `THROTTLE_AUTH_TTL` to `.env.example` with default values
- [x] 4.4 Apply `@UseGuards(ThrottlerGuard)` to `requestRegisterOtp`, `requestForgotPasswordOtp`, and `login` controller methods
- [x] 4.5 Write failing e2e test: 11 rapid login requests → first 10 succeed (or fail with 401), 11th returns 429
- [x] 4.6 Verify throttler guard is wired correctly and test passes

## 5. E2E Tests — Session Management

- [x] 5.1 Write e2e test: login 6 times → only 5 active tokens exist in mock, 6th call evicts the oldest
- [x] 5.2 Write e2e test: refresh with evicted token → 401 `REFRESH_TOKEN_INVALID`
- [x] 5.3 Verify all existing auth e2e tests still pass

## 6. Documentation

- [x] 6.1 Update `backend/src/modules/auth/CLAUDE.md` — add Refresh Token section noting: cap=5, lazy cleanup, tokenPrefix lookup, future cleanup job (E) deferred
- [x] 6.2 Update `backend/CLAUDE.md` scaling note for `RefreshToken` (prefix column is now implemented)
