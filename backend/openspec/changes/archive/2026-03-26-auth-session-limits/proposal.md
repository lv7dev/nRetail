## Why

Every login creates a new `RefreshToken` row with no upper bound. A user who logs in repeatedly (or an attacker brute-forcing credentials) can grow the table unboundedly, and each `/auth/refresh` call does a full table scan with bcrypt comparison per row — making refresh cost O(n) over time. The login endpoint also has no rate limiting, so there is no server-side defence against credential stuffing.

## What Changes

- Add rate limiting to `POST /auth/login` (and OTP request endpoints) via `@nestjs/throttler`
- Cap active refresh tokens per user at 5 — when a new token is issued and the user already has 5, delete the oldest
- Delete the user's own expired tokens lazily on each login (no cron needed)
- Add a `tokenPrefix` column to `RefreshToken` for fast O(1) lookup (replaces full table scan + bcrypt-per-row)
- **Future (not in this change):** scheduled cleanup job (E) to purge all expired rows globally — deferred until self-hosting or paid plan with multiple cron slots

## Capabilities

### New Capabilities
- `auth-rate-limiting`: Rate limiting on auth endpoints (login, OTP request) to prevent brute-force and spam
- `refresh-token-session-management`: Per-user token cap, lazy expiry cleanup, and fast prefix-based lookup for refresh tokens

### Modified Capabilities
- `password-login`: Login now enforces rate limiting and issues tokens within a per-user cap
- `phone-otp-auth`: OTP request endpoints now enforce rate limiting

## Impact

- `RefreshTokenRepository`: new `tokenPrefix` column, cap enforcement, lazy cleanup, rewritten `findAndDelete` (prefix lookup first, then bcrypt only the matching row)
- `AuthService.issueTokens`: calls updated repository methods
- `AuthModule`: registers `ThrottlerModule`, applies `ThrottlerGuard` to login + OTP endpoints
- Database: migration adding `tokenPrefix` column to `RefreshToken` table
- New dependency: `@nestjs/throttler` (already listed in recommended libs)
- No breaking changes to any API response shape
