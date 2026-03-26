## Context

Every `POST /auth/login` calls `issueTokens()` which calls `RefreshTokenRepository.create()` — always inserting a new row, no cap. `findAndDelete()` loads all non-expired rows and bcrypt-compares each one, making refresh O(n). There is no rate limiting on auth endpoints today.

The app is hosted on a free-tier platform (Vercel or equivalent) with a single cron slot. A global scheduled cleanup job (approach E) is therefore deferred — lazy per-user cleanup at login time is used instead.

The `RefreshToken` table schema today:
```
RefreshToken { id, userId, tokenHash, expiresAt }
```

## Goals / Non-Goals

**Goals:**
- Prevent unbounded `RefreshToken` table growth per user
- Make `findAndDelete` O(1) regardless of how many tokens a user has
- Rate-limit `POST /auth/login` and OTP request endpoints against brute-force / spam
- Support up to 5 parallel sessions per user (multi-device)
- Clean up a user's own expired tokens lazily on login (no cron needed)

**Non-Goals:**
- Global expired-token cleanup job (deferred — needs a paid cron slot)
- "Active sessions" management UI for users
- Per-device token naming or revocation by device
- Rate limiting on endpoints other than auth (separate concern)

## Decisions

### D1 — Token prefix column for O(1) lookup

**Decision:** Add a `tokenPrefix` column (first 8 hex chars of the raw token) to `RefreshToken`. `findAndDelete` queries `WHERE tokenPrefix = :prefix AND expiresAt > now()` to narrow to 1 row, then bcrypt-compares only that row.

**Why:** Current O(n) scan becomes O(1). The prefix is not secret — it just narrows the lookup. bcrypt still protects the full token.

**Alternative considered:** Store a salted SHA-256 of the full token and look up by hash. Rejected — same security but more complex; prefix is simpler and sufficient.

**Collision risk:** 8 hex chars = 32 bits, ~4 billion values. With a cap of 5 tokens per user, collision probability is negligible.

### D2 — Per-user cap at 5, delete oldest on overflow

**Decision:** When `issueTokens` is called and the user already has 5 non-expired tokens, delete the one with the earliest `expiresAt` before inserting the new one.

**Why:** Bounds worst-case table size and `findAndDelete` cost. 5 supports realistic multi-device use (phone + tablet + laptop + spare).

**Alternative considered:** Cap at 1 (single session). Rejected — breaks multi-device.

**Alternative considered:** Cap at 10. Rejected — unnecessarily permissive for a miniapp.

**Eviction policy:** Oldest by `expiresAt` (least recently issued). Simple, no extra columns needed.

### D3 — Lazy cleanup of expired tokens on login

**Decision:** On every `issueTokens` call, delete all expired tokens for that user (`WHERE userId = :id AND expiresAt < now()`) before applying the cap check.

**Why:** Keeps each user's active row count accurate without a global cron job. Cost is 1 extra DELETE per login, which is negligible relative to the bcrypt password check that already happened.

**Alternative considered:** Rely solely on the cap. Rejected — expired rows inflate the count, so a user with 5 expired tokens would evict valid sessions unnecessarily.

### D4 — Rate limiting via `@nestjs/throttler`

**Decision:** Apply `ThrottlerGuard` to `POST /auth/login`, `POST /auth/otp/register`, and `POST /auth/otp/forgot-password`. Limit: **10 requests per minute per IP**.

**Why:** Prevents credential stuffing on login and OTP flooding. `@nestjs/throttler` is already in the project's recommended libs, zero new infra needed.

**Alternative considered:** Redis-backed rate limiting for distributed accuracy. Rejected for now — single instance deployment, in-memory throttler is sufficient. Can be upgraded later.

**Endpoints NOT rate-limited:** `/auth/refresh`, `/auth/logout`, `/auth/me` — these require a valid token already, so brute-force doesn't apply.

## Risks / Trade-offs

- **Legitimate user hits rate limit** → 429 response with `Retry-After` header. Threshold of 10/min is generous enough that real users won't hit it. Adjustable via config.
- **5-session cap evicts a real device** → The evicted device gets a 401 on next refresh and re-prompts login. Acceptable UX trade-off for bounded security.
- **tokenPrefix collision** → Two tokens for the same user share a prefix (1-in-4B chance per pair). `findAndDelete` would bcrypt-compare both and match the correct one. Gracefully handled, no data loss.
- **Lazy cleanup misses globally abandoned sessions** → Users who never log in again leave up to 5 expired rows indefinitely. Acceptable at current scale; addressed by future cleanup job (E).

## Migration Plan

1. Add `tokenPrefix String` column to `RefreshToken` in Prisma schema
2. Generate and run migration — `tokenPrefix` defaults to `''` for existing rows (they will naturally expire within 30 days and never be queried by prefix)
3. Deploy new `RefreshTokenRepository` — `findAndDelete` tries prefix lookup first; falls back to full scan if `tokenPrefix` is empty (handles existing rows gracefully during transition)
4. After 30 days, all legacy rows (empty prefix) will have expired — fallback can be removed in a follow-up cleanup

## Open Questions

- Should the rate limit be configurable via env var (`THROTTLE_LOGIN_LIMIT`, `THROTTLE_LOGIN_TTL`) or hardcoded? Env var is cleaner for staging vs prod tuning.
- Should `POST /auth/reset-password` and `POST /auth/register` also be rate-limited? Low risk since they require a valid 5-min `otpToken`, but worth considering.
