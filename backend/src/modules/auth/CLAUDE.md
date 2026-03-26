# Auth Module — CLAUDE.md

## Purpose

Phone OTP + password authentication. Identity is proven by receiving an OTP on a known phone number. After OTP verification, the client either registers with a password or logs in with a password. Auth tokens are **never** issued directly from OTP verification — OTP only proves phone ownership.

---

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/otp/register` | — | Request OTP (phone must NOT exist) |
| POST | `/auth/otp/forgot-password` | — | Request OTP (phone MUST exist) |
| POST | `/auth/otp/verify` | — | Verify OTP → returns `otpToken` |
| POST | `/auth/register` | — | Register new user with `otpToken` + password |
| POST | `/auth/login` | — | Login with phone + password |
| POST | `/auth/reset-password` | — | Reset password with `otpToken` + new password |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | JWT | Invalidate refresh token |
| GET | `/auth/me` | JWT | Get current authenticated user |

---

## Authentication Flows

### Register flow

```
Client                              Server
  │                                   │
  │  POST /auth/otp/register          │
  │  { phone }                        │
  │ ─────────────────────────────────▶│
  │                                   │ 1. Check phone NOT in User table
  │                                   │    → 409 PHONE_ALREADY_EXISTS if exists
  │                                   │ 2. PhoneConfigRepo: check for defaultOtp
  │                                   │ 3. OtpRepo: delete old OTP, create new
  │                                   │    (SMS delivery stub — integrate here)
  │  200 OK                           │
  │◀─────────────────────────────────-│
  │                                   │
  │  POST /auth/otp/verify            │
  │  { phone, otp }                   │
  │ ─────────────────────────────────▶│
  │                                   │ 4. Find OTP record, check expiry/attempts
  │                                   │ 5. bcrypt.compare(otp, otpHash)
  │                                   │ 6. Delete OTP record on success
  │                                   │ 7. Sign otpToken JWT { phone, purpose:'register' }
  │  200 { otpToken }                 │     (5-min expiry)
  │◀─────────────────────────────────-│
  │                                   │
  │  POST /auth/register              │
  │  { otpToken, name,                │
  │    password, confirmPassword }    │
  │ ─────────────────────────────────▶│
  │                                   │ 8. Verify otpToken, assert purpose='register'
  │                                   │    → 401 OTP_PURPOSE_MISMATCH if wrong purpose
  │                                   │ 9. Assert password === confirmPassword
  │                                   │    → 400 PASSWORD_MISMATCH if differ
  │                                   │ 10. UsersService.create({ phone, name, hashedPassword })
  │                                   │ 11. issueTokens(user)
  │  201 { accessToken,               │
  │        refreshToken, user }       │
  │◀─────────────────────────────────-│
```

### Login flow

```
  POST /auth/login { phone, password }
    → UsersService.findByPhone(phone)
      - not found or no password → 401 INVALID_CREDENTIALS
    → bcrypt.compare(password, user.password)
      - fail → 401 INVALID_CREDENTIALS
    → issueTokens(user)
    ← 200 { accessToken, refreshToken, user }
```

### Forgot-password / Reset flow

```
Client                              Server
  │                                   │
  │  POST /auth/otp/forgot-password   │
  │  { phone }                        │
  │ ─────────────────────────────────▶│
  │                                   │ 1. Check phone IS in User table
  │                                   │    → 404 PHONE_NOT_FOUND if missing
  │                                   │ 2. Send OTP with purpose='reset'
  │  200 OK                           │
  │◀─────────────────────────────────-│
  │                                   │
  │  POST /auth/otp/verify            │
  │  { phone, otp }                   │
  │ ─────────────────────────────────▶│
  │                                   │ 3. Verify OTP, sign otpToken { phone, purpose:'reset' }
  │  200 { otpToken }                 │
  │◀─────────────────────────────────-│
  │                                   │
  │  POST /auth/reset-password        │
  │  { otpToken, newPassword,         │
  │    confirmPassword }              │
  │ ─────────────────────────────────▶│
  │                                   │ 4. Verify otpToken, assert purpose='reset'
  │                                   │    → 401 OTP_PURPOSE_MISMATCH if wrong purpose
  │                                   │ 5. Assert newPassword === confirmPassword
  │                                   │    → 400 PASSWORD_MISMATCH if differ
  │                                   │ 6. UsersService.updatePassword(userId, hashedPassword)
  │                                   │ 7. issueTokens(user)
  │  200 { accessToken,               │
  │        refreshToken, user }       │
  │◀─────────────────────────────────-│
```

### Token Refresh

```
  POST /auth/refresh { refreshToken }
    → RefreshTokenRepo.findAndDelete(rawToken)
      - not found → 401 REFRESH_TOKEN_INVALID
    → UsersService.findById(token.userId)
    → issueTokens(user)
    ← 200 { accessToken, refreshToken }
```

### Logout

```
  POST /auth/logout { refreshToken }   (requires JWT bearer)
    → RefreshTokenRepo.findAndDelete(rawToken)
    ← 204 No Content
```

---

## Error Codes

All business errors include a machine-readable `code` field for client-side i18n.

| Code | HTTP | Thrown by |
|------|------|-----------|
| `PHONE_ALREADY_EXISTS` | 409 | `requestRegisterOtp`, `register` |
| `PHONE_NOT_FOUND` | 404/401 | `requestForgotPasswordOtp`, `resetPassword` |
| `OTP_INVALID` | 401 | `verifyOtp` (wrong/blocked/missing), `verifyOtpToken` (bad JWT) |
| `OTP_EXPIRED` | 401 | `verifyOtp` (past `expiresAt`) |
| `OTP_PURPOSE_MISMATCH` | 401 | `verifyOtpToken` (wrong purpose claim) |
| `INVALID_CREDENTIALS` | 401 | `login` |
| `PASSWORD_MISMATCH` | 400 | `register`, `resetPassword` |
| `REFRESH_TOKEN_INVALID` | 401 | `refresh` |

Password fields require a minimum of **6 characters** (`@MinLength(6)` in `RegisterDto.password` and `ResetPasswordDto.newPassword`). This matches the frontend schema (`z.string().min(6, ...)`). Validation errors include a `constraint` field (e.g. `"minLength"`) so the frontend can translate via `t('validation.minLength')`.

## Input Format Rules

These rules are enforced at the DTO layer (before any business logic runs). They **must stay in sync** with the miniapp zod schemas:

| Field | Rule | Regex | Applied in |
|---|---|---|---|
| `phone` | Vietnamese local format | `/^0[0-9]{9}$/` | `RequestOtpDto`, `LoginDto` |
| `otp` | Exactly 6 digits | `/^[0-9]{6}$/` | `VerifyOtpDto` |
| `password` / `newPassword` | Min 6 characters | — | `RegisterDto`, `ResetPasswordDto` |

**Miniapp counterparts** (must match):
- Phone: `z.string().regex(/^0[0-9]{9}$/)` in `register/schema.ts`, `login/schema.ts`, `forgot-password/schema.ts`
- OTP: OtpInput component enforces digits; backend regex is the server-side guard
- Password: `z.string().min(6)` in register and reset schemas

---

## Token Details

### Access Token (JWT)

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Secret | `JWT_SECRET` env var |
| Expiry | `JWT_EXPIRES_IN` env var (e.g. `7d`) |
| Payload | `{ sub: userId, phone, role }` |
| Extraction | `Authorization: Bearer <token>` header |

`JwtStrategy.validate()` re-fetches the full user from DB on every authenticated request — revoked users are blocked immediately.

### OTP Token (JWT)

| Property | Value |
|---|---|
| Payload | `{ phone, purpose: 'register' \| 'reset' }` |
| Expiry | 5 minutes |
| Purpose | One-time bridge between OTP verification and register/reset-password |

The `purpose` claim enforces flow isolation — a `register` token cannot be used in the reset-password endpoint and vice versa.

### Refresh Token

| Property | Value |
|---|---|
| Generation | `crypto.randomBytes(32).toString('hex')` |
| Storage | bcrypt hash + `tokenPrefix` (first 8 hex chars) in `RefreshToken` table (rounds=10) |
| TTL | 30 days |
| Rotation | Deleted on use, new one issued |
| Max per user | **5 active sessions** (cap enforced in `issueTokens`) |

**Session cap behaviour:**
1. On every `issueTokens` call: delete all expired tokens for the user (lazy cleanup — no cron needed)
2. Count remaining active tokens
3. If count ≥ 5: delete the oldest (earliest `expiresAt`) → evicted device gets 401 on next refresh
4. Create new token

**`findAndDelete` lookup strategy:**
- Query `WHERE tokenPrefix = :prefix AND expiresAt > now()` → at most 1-2 rows
- bcrypt-compare only the matched row(s) → O(1) instead of O(n) full table scan
- Fallback to legacy scan for rows with empty `tokenPrefix` (old rows expire within 30 days)

**Future — global cleanup job (E):** A scheduled cron (`@nestjs/schedule`) to `DELETE WHERE expiresAt < now()` globally has been deferred until self-hosting or a paid plan with multiple cron slots is available. The per-user lazy cleanup above is sufficient for current scale.

### OTP

| Property | Value |
|---|---|
| Format | 6-digit numeric string |
| Storage | bcrypt hash in `OtpVerification` table (rounds=8) |
| TTL | 5 minutes |
| Max attempts | 3 |
| `purpose` column | `'register'` or `'reset'` (set at creation time) |
| On success | Record deleted immediately |

---

## PhoneConfig — Dev/Test Override

`PhoneConfigRepository` stores per-phone configuration. The only field is `defaultOtp`.

**If a phone has a `defaultOtp` set, that value is used instead of `'999999'` (the global fallback).** If no `PhoneConfig` row exists, or `defaultOtp` is null, the fallback `'999999'` is used.

This exists so test accounts can always use a known code without SMS delivery. In production, `defaultOtp` should never be set.

There is currently no admin API to manage these overrides — do it directly in the DB.

---

## Key Interfaces

```ts
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface UserRecord {
  id: string;
  phone: string;
  role: string;
}
```

---

## Rate Limiting

The global `ThrottlerGuard` (registered as `APP_GUARD` in `AppModule`) covers all routes automatically. Auth endpoints override the global default with stricter per-route limits:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /auth/login` | 10 req | 60s |
| `POST /auth/otp/register` | 6 req | 300s (aligned with OTP TTL) |
| `POST /auth/otp/forgot-password` | 6 req | 300s (aligned with OTP TTL) |
| All other auth endpoints | 100 req (global default) | 60s |

Overrides are set via `@Throttle({ default: { limit, ttl } })` on the controller method. `@UseGuards(ThrottlerGuard)` is **not** needed — the global guard handles it.

---

## Guards & Decorators

```ts
// Protect a route — requires valid JWT bearer token
@UseGuards(JwtAuthGuard)

// Get the authenticated user in a controller method
@CurrentUser() user: User

// RBAC
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

JWT validation is handled by `JwtStrategy` (Passport). Do not call `jwtService.verify` manually in controllers or services — use `verifyOtpToken()` in `AuthService` for OTP tokens only.

---

## Where SMS Delivery Goes

The private `sendOtp(phone, purpose)` method in `AuthService` generates and stores the OTP but does **not** send it. When integrating an SMS provider:

1. Inject an SMS service into `AuthService`
2. In `sendOtp()`, call it after `this.otpRepository.create(phone, otp, purpose)` — passing the raw `otp` (before hashing)
3. Keep delivery outside the repository

---

## Module Dependencies

```
AuthModule
  imports:  UsersModule (for UsersService — cross-module via service, not repo)
            PassportModule
            JwtModule (async, reads JWT_SECRET + JWT_EXPIRES_IN from ConfigService)
  exports:  AuthService

Note: ThrottlerModule is NOT imported here — it lives in AppModule as a global guard.
```

---

## Testing

Unit tests: `__tests__/auth.controller.spec.ts`, `__tests__/auth.service.spec.ts`
Integration tests: `test/auth.e2e-spec.ts`

**Test module setup:** Controller specs import `ThrottlerModule.forRoot([{ limit: 999, ttl: 1 }])` directly — do **not** use `overrideGuard(ThrottlerGuard)`. The high limit (999) prevents tests from hitting the throttle accidentally.

Key scenarios covered:
- OTP expired → 401 `OTP_EXPIRED`
- OTP max attempts → 401 `OTP_INVALID`
- Wrong OTP → increments attempts, 401 `OTP_INVALID`
- Correct OTP → returns `otpToken` (never auth tokens directly)
- Register with wrong-purpose otpToken → 401 `OTP_PURPOSE_MISMATCH`
- Password mismatch on register/reset → 400 `PASSWORD_MISMATCH`
- Login wrong credentials → 401 `INVALID_CREDENTIALS`
- Cross-flow token rejection (register token used in reset and vice versa)
- Validation errors (short password, missing fields) → 400 with `errors` array
- Refresh with unknown token → 401 `REFRESH_TOKEN_INVALID`
- Session cap: evicts oldest token when user has 5 active sessions
- Rate limit: login returns 429 after 10 requests within 60s
