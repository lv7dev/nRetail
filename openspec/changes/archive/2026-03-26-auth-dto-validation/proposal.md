## Why

Auth DTOs have incomplete validation: the OTP field accepts any string (not just 6 digits), phone fields accept any non-empty string (no format check), and password error messages use class-validator defaults that are grammatically misleading. These gaps produce confusing validation errors and allow semantically invalid input past the DTO layer.

## What Changes

- **`VerifyOtpDto.otp`**: replace `@Length(6, 6)` with `@Matches(/^[0-9]{6}$/)` + custom message — enforces exactly 6 digits with a correct English message
- **`RequestOtpDto.phone`** and **`LoginDto.phone`**: add `@Matches(/^0[0-9]{9}$/)` + custom message — enforces Vietnamese local phone format (10 digits, starts with 0), aligned with miniapp schema
- **`RegisterDto.password`** and **`ResetPasswordDto.newPassword`**: add custom `message` to `@MinLength(6)` — fixes the default "must be longer than or equal to 6 characters" → "must be at least 6 characters"
- **e2e test**: update `TEST_PHONE` from `'+84901234567'` to `'0901234567'` to match the new phone regex

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `phone-otp-auth`: OTP and phone fields now have format-level validation at the DTO layer
- `password-login`: phone field validated at DTO layer

## Impact

- **Backend**: `src/modules/auth/dto/verify-otp.dto.ts`, `request-otp.dto.ts`, `login.dto.ts`, `register.dto.ts`, `reset-password.dto.ts`
- **Tests**: `test/auth.e2e-spec.ts` (update `TEST_PHONE` constant)
- **Frontend**: no change — miniapp already validates with the same phone regex before submitting
- **No breaking changes** for valid inputs — only previously-accepted invalid inputs (non-digit OTP, wrong phone format) are now rejected earlier
