## Why

The current auth system is OTP-only with no password support, making it impossible to implement standard phone+password login, forgot-password flows, or future OAuth integrations. The existing `requestOtp` endpoint is also context-blind — it sends an OTP regardless of whether the phone is registered or not, which allows invalid flows (e.g. a registered user accidentally re-registering).

## What Changes

- **BREAKING** `POST /auth/otp/request` removed — split into two context-aware endpoints
- **BREAKING** `POST /auth/otp/verify` no longer returns auth tokens directly — returns a short-lived `otpToken` JWT with a `purpose` claim
- **BREAKING** `POST /auth/register` now requires `password` + `confirmPassword` fields
- Add `password` column (bcrypt hash) to `User` table — migration required
- Add `POST /auth/login` — phone + password authentication
- Add `POST /auth/otp/register` — sends OTP only if phone is NOT in users table
- Add `POST /auth/otp/forgot-password` — sends OTP only if phone IS in users table
- Add `POST /auth/reset-password` — verifies `otpToken` (purpose=reset) and updates password
- Fix `requestOtp` default OTP logic: use `PhoneConfig.defaultOtp ?? '999999'` (removes `generateOtp()`)
- Remove `phoneConfigRepository.upsert()` call from `register()` — PhoneConfig is managed manually
- Add backend integration tests covering all auth flow sequences

## Capabilities

### New Capabilities
- `password-login`: Phone + password authentication (login, forgot-password, reset-password flows)

### Modified Capabilities
- `phone-otp-auth`: OTP request endpoints split by flow context; `verifyOtp` now returns an `otpToken` instead of auth tokens directly
- `user-registration`: Registration now requires password + confirmPassword; `registrationToken` replaced by `otpToken` with `purpose: 'register'`

## Impact

- `backend/src/modules/auth/` — auth.service.ts, auth.controller.ts, DTOs, all test files
- `backend/prisma/schema.prisma` — User model gains `password` field
- New Prisma migration required
- `backend/src/modules/users/` — UsersService.create() must accept and store hashed password
- `backend/test/` — new integration test suite for auth flows
- Frontend auth calls will need updating when FE work begins (out of scope here)
