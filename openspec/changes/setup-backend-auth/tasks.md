## 1. Dependencies & Environment

- [x] 1.1 Install auth packages: `@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
- [x] 1.2 Install dev types: `@types/bcrypt @types/passport-jwt`
- [x] 1.3 Verify `.env` has `JWT_SECRET` (min 16 chars) and `JWT_EXPIRES_IN=15m`

## 2. Prisma Schema & Migration

- [x] 2.1 Add `Role` enum (`ADMIN`, `STAFF`, `CUSTOMER`) to `schema.prisma`
- [x] 2.2 Add `User` model (`id`, `phone` unique, `name`, `role`, `createdAt`, `updatedAt`)
- [x] 2.3 Add `RefreshToken` model (`id`, `tokenHash` unique, `userId` → User cascade, `expiresAt`, `createdAt`)
- [x] 2.4 Add `OtpVerification` model (`id`, `phone`, `otpHash`, `expiresAt`, `attempts`, `createdAt`) with index on `phone`
- [x] 2.5 Add `PhoneConfig` model (`id`, `phone` unique, `defaultOtp` default `"999999"`, `createdAt`)
- [x] 2.6 Run `npx prisma migrate dev --name init-auth` and verify migration succeeds
- [x] 2.7 Run `npx prisma generate` to update the Prisma client

## 3. Users Module

- [x] 3.1 Create `users.repository.ts` with methods: `findByPhone(phone)`, `create({ phone, name })`, `findById(id)`
- [x] 3.2 Implement `UsersService` using `UsersRepository`: `findByPhone`, `create`, `findById`
- [x] 3.3 Update `UsersModule` to provide `UsersRepository`, export `UsersService`
- [x] 3.4 Write unit tests for `UsersService` (`users.service.spec.ts`)

## 4. Auth Core — OTP

- [x] 4.1 Create `otp.repository.ts`: `findByPhone`, `deleteByPhone`, `create`, `incrementAttempts`, `delete`
- [x] 4.2 Create `phone-config.repository.ts`: `findByPhone`, `upsert`
- [x] 4.3 Implement `AuthService.requestOtp(phone)`:
  - Check `PhoneConfig` for phone → use `defaultOtp` or generate random 6-digit OTP
  - Delete any existing `OtpVerification` for this phone
  - Hash OTP with bcrypt (cost 8), store with `expiresAt = now + 5min`
- [x] 4.4 Implement `AuthService.verifyOtp(phone, otp)`:
  - Find `OtpVerification` by phone; reject if not found or expired
  - Reject without hash check if `attempts >= 3`
  - Compare hash; increment attempts on mismatch
  - On match: delete `OtpVerification` record, check if user exists
  - Existing user → return `{ tokens }` (call `issueTokens`)
  - New user → return `{ registrationToken }` (short-lived JWT, 5 min, payload: `{ phone }`)
- [x] 4.5 Write unit tests for `requestOtp` and `verifyOtp` (`auth.service.spec.ts`)

## 5. Auth Core — Registration & Session

- [x] 5.1 Create `refresh-token.repository.ts`: `create`, `findAndDelete(rawToken)`, `deleteAllByUserId`
- [x] 5.2 Implement `AuthService.issueTokens(user)`:
  - Sign JWT access token (`sub`, `phone`, `role`, 15 min)
  - Generate 32-byte random refresh token (hex), hash with bcrypt (cost 10)
  - Store hash in `RefreshToken` with `expiresAt = now + 30d`
  - Return `{ accessToken, refreshToken (raw) }`
- [x] 5.3 Implement `AuthService.register(registrationToken, name)`:
  - Verify and decode `registrationToken` JWT
  - Reject if expired or invalid
  - Reject if phone already has a user (`409`)
  - Create user via `UsersService.create`
  - Upsert phone into `PhoneConfig`
  - Call `issueTokens` and return
- [x] 5.4 Implement `AuthService.refresh(rawRefreshToken)`:
  - Hash token, find matching `RefreshToken` in DB
  - Reject if not found or expired (`401`)
  - Delete old record (rotation)
  - Call `issueTokens(user)` and return new pair
  - On reuse detection (token not found but recently valid): delete all user tokens
- [x] 5.5 Implement `AuthService.logout(userId, rawRefreshToken)`:
  - Find and delete matching `RefreshToken`
  - Return gracefully even if not found (idempotent)
- [x] 5.6 Write unit tests for `register`, `refresh`, `logout`, `issueTokens`

## 6. JWT Strategy & Guards

- [x] 6.1 Create `jwt.strategy.ts` (Passport `ExtractJwt.fromAuthHeaderAsBearerToken`, validate returns user from `UsersService.findById`)
- [x] 6.2 Create `shared/guards/jwt-auth.guard.ts` extending `AuthGuard('jwt')`
- [x] 6.3 Create `shared/decorators/current-user.decorator.ts` extracting user from `request.user`
- [x] 6.4 Register `JwtModule` and `PassportModule` in `AuthModule`
- [x] 6.5 Import `UsersModule` in `AuthModule`

## 7. DTOs

- [x] 7.1 `RequestOtpDto`: `phone: string` (`@IsPhoneNumber` or `@IsString` + `@IsNotEmpty`)
- [x] 7.2 `VerifyOtpDto`: `phone: string`, `otp: string` (length 6, `@IsString`)
- [x] 7.3 `RegisterDto`: `registrationToken: string`, `name: string` (`@IsNotEmpty`)
- [x] 7.4 `RefreshDto`: `refreshToken: string` (`@IsString`, `@IsNotEmpty`)
- [x] 7.5 `LogoutDto`: `refreshToken: string`
- [x] 7.6 All DTOs: add `@ApiProperty()` decorators for Swagger

## 8. Controller

- [x] 8.1 `POST /auth/otp/request` — calls `authService.requestOtp`, returns `200`
- [x] 8.2 `POST /auth/otp/verify` — calls `authService.verifyOtp`, returns tokens or `{ registrationToken }`
- [x] 8.3 `POST /auth/register` — calls `authService.register`, returns tokens + user
- [x] 8.4 `POST /auth/refresh` — calls `authService.refresh`, returns new token pair
- [x] 8.5 `POST /auth/logout` — `@UseGuards(JwtAuthGuard)`, calls `authService.logout`, returns `204`
- [x] 8.6 `GET /auth/me` — `@UseGuards(JwtAuthGuard)`, returns `@CurrentUser()` data
- [x] 8.7 Write controller unit tests (`auth.controller.spec.ts`)

## 9. Wiring & Verification

- [x] 9.1 Register `AuthModule` and `UsersModule` in `app.module.ts`
- [x] 9.2 Ensure `ValidationPipe` is global in `main.ts` (`whitelist: true, forbidNonWhitelisted: true`)
- [x] 9.3 Run `npm run test` — all tests pass
- [x] 9.4 Run `npm run lint` — no errors
- [ ] 9.5 Start server and manually test the full flow via Swagger (`/api/docs`):
  - Request OTP → verify → register (new user path)
  - Request OTP → verify → get tokens (existing user path)
  - Call `/auth/me` with access token
  - Refresh tokens
  - Logout
