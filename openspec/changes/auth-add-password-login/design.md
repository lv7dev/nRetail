## Context

The current auth system uses phone OTP as the sole authentication mechanism. `POST /auth/otp/verify` returns auth tokens directly, which makes OTP the only way to prove identity. This blocks adding password-based login, forgot-password flows, and future OAuth integrations (Zalo will supply a phone number but no OTP).

The system must evolve to treat OTP as a **phone ownership proof mechanism** (not an auth mechanism), and add passwords as the primary login credential.

## Goals / Non-Goals

**Goals:**
- Add phone + password login (`POST /auth/login`)
- Add forgot-password flow (OTP → reset password)
- Fix context-blind OTP request: split by flow, enforce user existence preconditions
- Make OTP verify return a reusable `otpToken` (phone ownership proof), not auth tokens
- Fix `requestOtp` default OTP: use `PhoneConfig.defaultOtp ?? '999999'` (no random generation until SMS is wired)
- Remove auto-insert of PhoneConfig on registration (manual management only)
- Add backend integration tests covering all auth flow sequences

**Non-Goals:**
- Zalo OAuth integration (future — the architecture accommodates it via nullable password)
- OTP-only login (removed — login is phone + password from now on)
- Email authentication
- Two-factor authentication

## Decisions

### 1. Split OTP request endpoints vs single endpoint with `flow` param

**Decision:** Two endpoints — `POST /auth/otp/register` and `POST /auth/otp/forgot-password`

**Rationale:** A `flow` param makes the behavior change on a runtime string value, which is hard to trace, easy to omit, and couples unrelated logic. Two endpoints make each precondition explicit at the URL level and allow independent rate limiting, logging, and future policy changes per flow.

**Alternative considered:** Single endpoint with `flow: 'register' | 'forgot-password'` body param. Rejected because of hidden branching and weak defaults.

### 2. Single shared `POST /auth/otp/verify` vs two separate verify endpoints

**Decision:** One shared verify endpoint. Purpose is embedded in the returned `otpToken` JWT.

**Rationale:** OTP validation logic is identical regardless of flow — same expiry check, attempt tracking, bcrypt compare. The purpose only matters to the downstream endpoint (`/auth/register` or `/auth/reset-password`), not to the verify step itself.

**How purpose is stored:** When an OTP is created, the `OtpVerification` record stores a `purpose` column (`register` | `reset`). On successful verify, the server reads this purpose and signs it into the `otpToken`. The client cannot forge the purpose.

### 3. Password hashing location — AuthService vs UsersService

**Decision:** Hash passwords in `UsersService.create()` (and in `AuthService.resetPassword()` before calling users service).

**Rationale:** `UsersService` is the owner of user data. Future Zalo OAuth will call `UsersService.create()` with no password — keeping hashing inside UsersService ensures no caller bypasses it accidentally. The service accepts raw password and hashes internally.

**Alternative considered:** Hash in `AuthService` before passing to `UsersService`. Rejected because it would require the auth module to know bcrypt rounds, and any future caller of `UsersService.create()` would need to pre-hash.

### 4. Password column nullability

**Decision:** `User.password` is nullable (`String?` in Prisma).

**Rationale:** Future Zalo OAuth creates users with a phone but no password. Null password = "no password auth method available for this user." The login endpoint returns `401` with a clear message if `password` is null.

### 5. `otpToken` JWT shape

```
{
  phone: string,
  purpose: 'register' | 'reset',
  exp: now + 5min
}
```

Downstream endpoints validate `purpose` matches their expected value and reject mismatches with `401`.

### 6. Default OTP — remove `generateOtp()`, use `'999999'` fallback

**Decision:** `requestOtp` uses `config?.defaultOtp ?? '999999'`. No random generation.

**Rationale:** Random OTPs are only useful when SMS delivery is wired up. Until then, a random OTP is untestable. When SMS is integrated, the fallback will be replaced with `generateOtp()` + SMS send, and `PhoneConfig.defaultOtp` becomes the override mechanism.

## Risks / Trade-offs

- **Breaking API contract** → `POST /auth/otp/verify` response shape changes. All clients calling it must update. Frontend is the only consumer; update is in scope for the next FE sprint.
- **Nullable password for existing users** → Users created before this change will have `password = null`. They cannot log in until they set a password via the forgot-password flow. Since this is a dev/test system with no real users yet, risk is low.
- **OtpVerification gains `purpose` column** → Migration required. Existing rows (if any) will need a default value for `purpose`. Use `'register'` as migration default (safe assumption for existing test data).
- **bcrypt cost on login** → Every login does a bcrypt compare. At rounds=10 this is ~100ms, acceptable. If login volume grows, consider argon2id with lower memory cost.

## Migration Plan

1. Add `password String?` to `User` model in schema.prisma
2. Add `purpose String @default("register")` to `OtpVerification` model
3. Run `npx prisma migrate dev --name add-password-and-otp-purpose`
4. Run `npx prisma generate`
5. Deploy new auth service code
6. No data backfill needed (existing users keep null password; they would use forgot-password to set one)
7. Rollback: revert migration + code deploy (no data loss since password column is nullable)

## Open Questions

- None — all design decisions resolved in explore session.
