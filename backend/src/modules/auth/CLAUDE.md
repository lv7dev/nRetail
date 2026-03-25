# Auth Module — CLAUDE.md

## Purpose

Phone-based OTP authentication with JWT access tokens and rotating refresh tokens. No passwords — identity is proven by receiving an OTP on a known phone number.

---

## Authentication Flow

### Login (existing user)

```
Client                          Server
  │                               │
  │  POST /auth/otp/request       │
  │  { phone }                    │
  │ ─────────────────────────────▶│
  │                               │ 1. PhoneConfigRepo: check for defaultOtp override
  │                               │ 2. OtpRepo: delete any existing OTPs for this phone
  │                               │ 3. OtpRepo: create new OTP (bcrypt hash, 5min TTL)
  │                               │    (OTP delivery to user is NOT implemented here —
  │                               │     currently a no-op; SMS integration goes here)
  │  200 OK (no body)             │
  │◀─────────────────────────────-│
  │                               │
  │  POST /auth/otp/verify        │
  │  { phone, otp }               │
  │ ─────────────────────────────▶│
  │                               │ 4. Find OTP record for phone
  │                               │ 5. Check expiry (5 min)
  │                               │ 6. Check attempts (max 3)
  │                               │ 7. bcrypt.compare(otp, otpHash)
  │                               │    - fail → increment attempts, throw 401
  │                               │    - pass → delete OTP record
  │                               │ 8. UsersService.findByPhone(phone)
  │                               │    - found → issueTokens(user)
  │  200 { accessToken,           │
  │        refreshToken, user }   │
  │◀─────────────────────────────-│
```

### Registration (new user)

After step 8 above, if the phone is not found:

```
  │                               │ 8b. Phone not found → sign registrationToken JWT
  │                               │     payload: { phone }, expiresIn: 5min
  │  200 { registrationToken }    │
  │◀─────────────────────────────-│
  │                               │
  │  POST /auth/register          │
  │  { registrationToken, name }  │
  │ ─────────────────────────────▶│
  │                               │ 9.  jwtService.verifyAsync(registrationToken)
  │                               │     → extract phone
  │                               │ 10. UsersService.create({ phone, name })
  │                               │ 11. PhoneConfigRepo.upsert(phone) — init dev config
  │                               │ 12. issueTokens(user)
  │  201 { accessToken,           │
  │        refreshToken, user }   │
  │◀─────────────────────────────-│
```

### Token Refresh

```
  POST /auth/refresh { refreshToken }
    → RefreshTokenRepo.findAndDelete(rawToken)
      - linear scan of non-expired tokens, bcrypt.compare each
      - deletes matched record (rotate on use)
    → UsersService.findById(token.userId)
    → issueTokens(user)
    ← { accessToken, refreshToken }
```

### Logout

```
  POST /auth/logout { refreshToken }   (requires JWT bearer)
    → RefreshTokenRepo.findAndDelete(rawToken)
    ← 204 No Content
```

---

## Token Details

### Access Token (JWT)

| Property | Value |
|---|---|
| Algorithm | HS256 (passport-jwt default) |
| Secret | `JWT_SECRET` env var |
| Expiry | `JWT_EXPIRES_IN` env var (e.g. `7d`) |
| Payload | `{ sub: userId, phone, role }` |
| Extraction | `Authorization: Bearer <token>` header |

`JwtStrategy.validate()` re-fetches the full user from DB on every authenticated request — so revoked users are blocked immediately even with a valid token (at the cost of one DB query per request).

### Refresh Token

| Property | Value |
|---|---|
| Generation | `crypto.randomBytes(32).toString('hex')` |
| Storage | bcrypt hash in `RefreshToken` table (rounds=10) |
| TTL | 30 days |
| Rotation | Deleted on use, new one issued |

**Scaling note:** `findAndDelete` does a full table scan + bcrypt compare on all non-expired tokens. This is safe at low volume but becomes a bottleneck if one user accumulates many active sessions or token count grows large. A future fix: store a fast-lookup prefix (first 8 hex chars) as a plain column, filter by prefix first, then bcrypt compare the candidates.

### OTP

| Property | Value |
|---|---|
| Format | 6-digit numeric string |
| Storage | bcrypt hash in `OtpVerification` table (rounds=8) |
| TTL | 5 minutes |
| Max attempts | 3 (counted per OTP record) |
| On success | OTP record deleted immediately |

---

## PhoneConfig — Dev/Test Override

`PhoneConfigRepository` stores per-phone configuration. Currently its only field is `defaultOtp`.

**If a phone has a `defaultOtp` set, that value is used instead of generating a random OTP.**

This exists so test accounts can always use a known code (e.g. `123456`) without needing SMS delivery. In production, `defaultOtp` should never be set. The `register` flow calls `PhoneConfigRepo.upsert(phone)` after creating a new user to initialize the row (with no defaultOtp).

There is currently no admin API to manage these overrides — do it directly in the DB.

---

## Key Interfaces

```ts
// Returned by verifyOtp — shape depends on whether phone is known
interface VerifyOtpResult {
  accessToken?: string;       // present if existing user
  refreshToken?: string;      // present if existing user
  user?: UserRecord;          // present if existing user
  registrationToken?: string; // present if new user (mutually exclusive with above)
}

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

`VerifyOtpResult` intentionally uses all-optional fields to represent the two-path response. The two paths are mutually exclusive: either `{ accessToken, refreshToken, user }` (existing) or `{ registrationToken }` (new). Do not add a third path here without updating both `verifyOtp` and `register`.

---

## Guards & Decorators

```ts
// Protect a route — requires valid JWT bearer token
@UseGuards(JwtAuthGuard)

// Get the authenticated user in a controller method
@CurrentUser() user: User

// Combine for most authenticated endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

JWT validation is handled by `JwtStrategy` (Passport). Do not call `jwtService.verify` manually in controllers or services.

---

## Where SMS Delivery Goes

`AuthService.requestOtp()` generates and stores the OTP but does **not** send it anywhere. SMS delivery is a stub. When integrating an SMS provider:

1. Inject an SMS service into `AuthService`
2. Call it after `this.otpRepository.create(phone, otp)` — passing the raw `otp` (before it's hashed)
3. Keep the delivery call outside the repository — repositories are pure data access

---

## Module Dependencies

```
AuthModule
  imports:  UsersModule (for UsersService — cross-module via service, not repo)
            PassportModule
            JwtModule (async, reads JWT_SECRET + JWT_EXPIRES_IN from ConfigService)
  exports:  AuthService (consumed by any module that needs to validate auth state)
```

`AuthModule` imports `UsersModule` and uses `UsersService` — this is the correct pattern. It does **not** import `UsersRepository` directly.

---

## Testing

Unit tests live in `__tests__/auth.service.spec.ts` and `__tests__/auth.controller.spec.ts`. All repositories and `UsersService` are mocked.

Key scenarios to keep covered:
- OTP expired → 401
- OTP max attempts → 401
- Invalid OTP → increments attempts
- Valid OTP + existing user → token pair
- Valid OTP + new user → registrationToken only
- Invalid registrationToken on register → 401
- Refresh with unknown/expired token → 401
- Refresh rotates token (old one invalidated)
