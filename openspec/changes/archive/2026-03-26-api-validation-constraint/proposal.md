## Why

Validation error responses from the backend lack machine-readable `constraint` names, making it impossible for the frontend to translate field-level errors into the user's language. Additionally, the backend enforces `@MinLength(8)` on password fields while the frontend schema already uses `min(6)`, causing registration to silently reject passwords the UI allowed.

## What Changes

- Change `@MinLength(8)` → `@MinLength(6)` on `password` in `RegisterDto` and `newPassword` in `ResetPasswordDto`
- Add a custom `exceptionFactory` to the global `ValidationPipe` that produces structured validation errors with a `constraint` field (e.g. `minLength`, `isNotEmpty`) extracted from class-validator's `ValidationError.constraints` object
- Update `AllExceptionsFilter` to detect and pass through the new structured `errors` array (no longer the raw string-array shape from NestJS default ValidationPipe)
- Update unit and e2e tests to assert the `constraint` field is present in validation error responses

## Capabilities

### New Capabilities

_(none — this is a refinement of existing error-response behavior)_

### Modified Capabilities

- `api-error-responses`: Validation error items now include a `constraint` field so the frontend can map to translated messages via `t('validation.${constraint}')`

## Impact

- **Backend**: `src/shared/pipes/validation.pipe.ts`, `src/shared/filters/http-exception.filter.ts`, `src/modules/auth/dto/register.dto.ts`, `src/modules/auth/dto/reset-password.dto.ts`
- **Tests**: `src/shared/filters/__tests__/http-exception.filter.spec.ts`, `src/modules/auth/__tests__/auth.service.spec.ts`, `test/auth.e2e-spec.ts`
- **Frontend**: No code changes needed — frontend already uses `t('validation.${constraint}')` pattern and `min(6)` schema; just needs BE to emit `constraint` in the error payload
- **No breaking changes** — existing `field` and `message` fields are preserved; `constraint` is additive
