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

Password fields require a minimum of **6 characters** (`@MinLength(6)` in `RegisterDto.password` and `ResetPasswordDto.newPassword`). This matches the frontend schema (`z.string().min(6, ...)`). Validation errors include a `constraint` field (e.g. `"minLength"`) so the frontend can translate via `t('validation.minLength')`.
| `REFRESH_TOKEN_INVALID` | 401 | `refresh` |

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
| Storage | bcrypt hash in `RefreshToken` table (rounds=10) |
| TTL | 30 days |
| Rotation | Deleted on use, new one issued |

**Scaling note:** `findAndDelete` does a full table scan + bcrypt compare. Safe at low volume. Future fix: store a fast-lookup prefix column.

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
```

---

## Testing

Unit tests: `__tests__/auth.service.spec.ts`
Integration tests: `test/auth.e2e-spec.ts`

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
