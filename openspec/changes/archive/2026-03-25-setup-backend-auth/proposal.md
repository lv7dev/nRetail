## Why

The nRetail backend has an empty `auth` module with no logic. The Zalo Mini App frontend needs a working authentication API so users can identify themselves by phone number — the same phone Zalo will provide in Phase 2. Building this now establishes the auth contract before any other module depends on it.

## What Changes

- Add OTP-based phone authentication (request OTP → verify OTP → login or register)
- Add `PhoneConfig` table for dev-mode default OTP bypass (999999)
- Add `OtpVerification` table for storing hashed, time-limited OTPs
- Add `User` model with phone + name + role to Prisma schema
- Add `RefreshToken` model for rotating refresh token storage
- Implement JWT access tokens (15 min) + opaque refresh tokens (30 days)
- Expose 6 endpoints under `/auth`: `otp/request`, `otp/verify`, `register`, `refresh`, `logout`, `me`
- Add shared `JwtAuthGuard` and `@CurrentUser()` decorator used by all future modules
- Implement `UsersService` with `findByPhone`, `create`, `findById`

## Capabilities

### New Capabilities

- `phone-otp-auth`: OTP request/verify flow with PhoneConfig bypass and brute-force protection
- `user-registration`: New user creation by phone + name after OTP verification
- `jwt-session`: JWT access token issuance, refresh token rotation, and logout
- `user-identity`: User model (phone, name, role) and identity resolution via `/auth/me`

### Modified Capabilities

*(none — auth module is empty, no existing specs affected)*

## Impact

- **Prisma schema**: New models `User`, `RefreshToken`, `OtpVerification`, `PhoneConfig`, enum `Role`
- **New migration**: First real Prisma migration
- **Packages to install**: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `@types/bcrypt`, `@types/passport-jwt`
- **Shared guards**: `JwtAuthGuard`, `@CurrentUser()` decorator — depended on by all future modules
- **No breaking changes** — nothing else depends on auth yet
