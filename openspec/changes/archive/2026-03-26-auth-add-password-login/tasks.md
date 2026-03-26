## 1. Database Migration

- [x] 1.1 Add `password String?` to `User` model in `prisma/schema.prisma`
- [x] 1.2 Add `purpose String @default("register")` to `OtpVerification` model in `prisma/schema.prisma`
- [x] 1.3 Run `npx prisma migrate dev --name add-password-and-otp-purpose` and commit migration file
- [x] 1.4 Run `npx prisma generate` and verify no TypeScript errors

## 2. Fix requestOtp Default OTP Logic

- [x] 2.1 Update `AuthService.requestOtp()` to use `config?.defaultOtp ?? '999999'` (remove `generateOtp()`)
- [x] 2.2 Update `auth.service.spec.ts` `requestOtp` tests to reflect new fallback behavior (no more random OTP test)

## 3. Split OTP Request Endpoints

- [x] 3.1 Add `requestRegisterOtp(phone)` to `AuthService` — checks user NOT exists, creates OTP with `purpose='register'`, throws `409` if already registered
- [x] 3.2 Add `requestForgotPasswordOtp(phone)` to `AuthService` — checks user IS exists, creates OTP with `purpose='reset'`, throws `404` if not found
- [x] 3.3 Remove old `requestOtp(phone)` method from `AuthService`
- [x] 3.4 Add `POST /auth/otp/register` endpoint to `AuthController` (calls `requestRegisterOtp`)
- [x] 3.5 Add `POST /auth/otp/forgot-password` endpoint to `AuthController` (calls `requestForgotPasswordOtp`)
- [x] 3.6 Remove `POST /auth/otp/request` route from `AuthController`
- [x] 3.7 Create `RequestOtpDto` (just `phone` field with `@IsPhoneNumber()`) — reuse for both endpoints

## 4. Update verifyOtp to Return otpToken

- [x] 4.1 Update `AuthService.verifyOtp()` to read `purpose` from the `OtpVerification` record
- [x] 4.2 Return `{ otpToken: JWT{ phone, purpose, exp: 5min } }` instead of tokens or registrationToken
- [x] 4.3 Update `VerifyOtpResult` interface to `{ otpToken: string }` (remove accessToken, refreshToken, user, registrationToken fields)
- [x] 4.4 Update `auth.service.spec.ts` `verifyOtp` tests for both `register` and `reset` purpose cases

## 5. Update Registration to Accept otpToken + Password

- [x] 5.1 Update `RegisterDto` — replace `registrationToken` with `otpToken`, add `password` and `confirmPassword` fields with validation
- [x] 5.2 Update `AuthService.register()` — verify `otpToken`, assert `purpose === 'register'`, validate passwords match, hash password, create user (without PhoneConfig upsert)
- [x] 5.3 Remove `phoneConfigRepository.upsert()` call from `AuthService.register()`
- [x] 5.4 Update `UsersService.create()` to accept an optional `password` field
- [x] 5.5 Update `UsersRepository.create()` to persist `password` (hashed) on the `User` record
- [x] 5.6 Update `auth.service.spec.ts` registration tests for new DTO shape and no PhoneConfig upsert

## 6. Add Login Endpoint

- [x] 6.1 Create `LoginDto` with `phone` and `password` fields
- [x] 6.2 Add `login(phone, password)` method to `AuthService` — find user, compare bcrypt hash, throw `401` if not found / no password / wrong password, return `TokenPair + user`
- [x] 6.3 Add `POST /auth/login` endpoint to `AuthController`
- [x] 6.4 Write `auth.service.spec.ts` tests for login (success, wrong password, user not found, null password)

## 7. Add Reset Password Endpoint

- [x] 7.1 Create `ResetPasswordDto` with `otpToken`, `newPassword`, `confirmPassword` fields
- [x] 7.2 Add `resetPassword(otpToken, newPassword, confirmPassword)` to `AuthService` — verify token purpose=reset, validate passwords match, hash new password, update user, return tokens
- [x] 7.3 Add `POST /auth/reset-password` endpoint to `AuthController`
- [x] 7.4 Write `auth.service.spec.ts` tests for reset-password (success, wrong purpose, passwords mismatch, expired token, user not found)

## 8. Backend Integration Tests

- [x] 8.1 Set up `AuthModule` integration test scaffold in `test/auth.e2e-spec.ts` using `@nestjs/testing` + `supertest` (mock repositories only)
- [x] 8.2 Write full register flow test: `POST /auth/otp/register` → `POST /auth/otp/verify` → `POST /auth/register`
- [x] 8.3 Write full login flow test: user exists with password → `POST /auth/login` → tokens returned
- [x] 8.4 Write full forgot-password flow test: `POST /auth/otp/forgot-password` → `POST /auth/otp/verify` → `POST /auth/reset-password`
- [x] 8.5 Write cross-flow rejection tests: register OTP used in reset-password endpoint returns 401; forgot-password OTP used in register endpoint returns 401
- [x] 8.6 Write register-blocked test: `POST /auth/otp/register` for an existing phone returns 409
- [x] 8.7 Write forgot-password-blocked test: `POST /auth/otp/forgot-password` for unknown phone returns 404
