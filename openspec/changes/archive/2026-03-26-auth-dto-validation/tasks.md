## 1. OTP field — VerifyOtpDto

- [x] 1.1 Update `src/modules/auth/dto/verify-otp.dto.ts`: replace `@Length(6, 6)` with `@Matches(/^[0-9]{6}$/, { message: 'OTP must be exactly 6 digits' })`, remove `Length` import

## 2. Phone field — RequestOtpDto

- [x] 2.1 Update `src/modules/auth/dto/request-otp.dto.ts`: add `@Matches(/^0[0-9]{9}$/, { message: 'Phone number must be in format 0xxxxxxxxx' })`, remove `@IsNotEmpty()` from `phone` (regex rejects empty), add `Matches` import

## 3. Phone field — LoginDto

- [x] 3.1 Update `src/modules/auth/dto/login.dto.ts`: same phone regex as task 2.1, remove `@IsNotEmpty()` from `phone`

## 4. Password message — RegisterDto and ResetPasswordDto

- [x] 4.1 Update `src/modules/auth/dto/register.dto.ts`: add `{ message: 'Password must be at least 6 characters' }` to `@MinLength(6)`
- [x] 4.2 Update `src/modules/auth/dto/reset-password.dto.ts`: add `{ message: 'New password must be at least 6 characters' }` to `@MinLength(6)`

## 5. Update e2e test

- [x] 5.1 Update `test/auth.e2e-spec.ts`: change `TEST_PHONE` from `'+84901234567'` to `'0901234567'`
- [x] 5.2 Run `npm run test:e2e` — all auth e2e tests pass

## 6. Run unit tests and update docs

- [x] 6.1 Run `npm run test` — all unit tests pass
- [x] 6.2 Update `src/modules/auth/CLAUDE.md` to document phone format rule (`/^0[0-9]{9}$/`) and OTP format rule (`/^[0-9]{6}$/`), note both must match miniapp zod schemas
