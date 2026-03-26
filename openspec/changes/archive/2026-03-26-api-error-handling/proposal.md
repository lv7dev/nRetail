## Why

Validation errors from `ValidationPipe` are silently swallowed by `AllExceptionsFilter`, returning a generic "Bad Request" with no field-level detail — users have no idea what to fix. Additionally, business errors (wrong password, OTP expired, etc.) return plain English strings, making client-side i18n impossible.

## What Changes

- **Fix `AllExceptionsFilter`** to call `exception.getResponse()` instead of `exception.message`, surfacing per-field validation errors from `ValidationPipe`
- **Standardize validation error shape**: `{ statusCode, message, errors: [{ field, message }] }`
- **Add `code` field to all auth service errors**: machine-readable keys (e.g. `PHONE_ALREADY_EXISTS`, `OTP_INVALID`, `PASSWORD_MISMATCH`) alongside the English message
- **Document error codes** so the frontend can map them to i18n translation keys

Out of scope: frontend i18n integration (handled separately after auth API integration).

## Capabilities

### New Capabilities

- `api-error-responses`: Standardized error response shape across all endpoints — validation errors with field-level detail, business errors with machine-readable `code` field

### Modified Capabilities

- `phone-otp-auth`: Auth service errors now include a `code` field in addition to the existing `message`
- `password-login`: Login errors now include a `code` field

## Impact

- `src/shared/filters/http-exception.filter.ts` — logic change to surface full response
- `src/modules/auth/auth.service.ts` — all `throw new XxxException(...)` updated to include `code`
- All API consumers receive richer error payloads (additive, not breaking for existing clients that only read `message`)
