## Context

All auth DTOs currently use only `@IsString()` + `@IsNotEmpty()` for string fields. This is sufficient for required-field checking but not for semantic validation. Three specific gaps:

1. `otp`: `@Length(6, 6)` accepts any 6-character string — `"abcdef"` passes, `"abc123"` passes. The generated English message `"must be longer than or equal to 6 characters"` is also grammatically wrong for an exact-length rule.
2. `phone`: completely unvalidated beyond non-empty. `"hello"`, `"123"`, and `"+1 800 FLOWERS"` all pass.
3. Password `@MinLength(6)` messages: class-validator generates `"password must be longer than or equal to 6 characters"` — "longer than or equal to" is technically correct but awkward.

## Goals / Non-Goals

**Goals:**
- OTP field rejects non-digit and wrong-length values at the DTO layer with a clear English message
- Phone fields enforce Vietnamese local format (`0xxxxxxxxx`) matching the miniapp schema
- Password `minLength` messages read naturally in English
- All changes produce correct `constraint` + `params` via the existing `exceptionFactory`

**Non-Goals:**
- `LoginDto.password` min-length — login validates by bcrypt comparison, not length; adding `@MinLength(6)` here would give a misleading error to anyone with a legacy short password
- International phone format support — out of scope; local format only for now
- Frontend changes — miniapp already uses the same phone regex

## Decisions

### OTP: `@Matches` replaces `@Length(6, 6)`

```ts
@Matches(/^[0-9]{6}$/, { message: 'OTP must be exactly 6 digits' })
```

`@Matches` handles both the character class (digits only) and the exact length (regex anchors `^...$` with `{6}`). `@Length(6, 6)` becomes redundant and is removed. The constraint key becomes `matches` with `params: { pattern: '/^[0-9]{6}$/' }`.

### Phone: `@Matches` with Vietnamese local format

```ts
@Matches(/^0[0-9]{9}$/, { message: 'Phone number must be in format 0xxxxxxxxx' })
```

Applied to `RequestOtpDto.phone` and `LoginDto.phone`. Pattern matches the miniapp zod schema (`/^0[0-9]{9}$/`) exactly — 10 digits, leading zero. `@IsNotEmpty()` becomes redundant (empty string fails the regex) and is removed from the phone field.

### Password: custom `message` on `@MinLength`

```ts
@MinLength(6, { message: 'Password must be at least 6 characters' })
```

Applied to `RegisterDto.password` and `ResetPasswordDto.newPassword`. The `constraint` key stays `minLength`, `params` stays `{ min: 6 }` — only the English fallback message changes.

### e2e test: update `TEST_PHONE`

`TEST_PHONE = '+84901234567'` → `'0901234567'`. No other test logic changes — the phone value is used as an identifier only.

## Risks / Trade-offs

- **Regex maintenance**: phone and OTP patterns are now in two places (BE DTOs + FE zod schemas). If the format changes, both must be updated. Acceptable at this project size; document in `auth/CLAUDE.md`.
- **`@IsNotEmpty()` removal on phone**: the regex already rejects empty strings, so removing `@IsNotEmpty()` is safe. If the regex ever becomes optional (e.g. `@IsOptional()`), `@IsNotEmpty()` would need to come back.
