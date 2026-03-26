## Context

`AllExceptionsFilter` currently reads `exception.message` for `HttpException`s. For NestJS `BadRequestException` thrown by `ValidationPipe`, `.message` returns the string `"Bad Request"` — the actual per-field errors are in `exception.getResponse()`. Business exceptions in `auth.service.ts` throw with a plain English string only, making client-side i18n impossible.

Current broken flow:
```
ValidationPipe throws BadRequestException({
  statusCode: 400,
  message: ["password must be longer than or equal to 8 characters"],
  error: "Bad Request"
})
→ AllExceptionsFilter reads exception.message → "Bad Request"
→ Client receives: { statusCode: 400, message: "Bad Request" }  ← useless
```

## Goals / Non-Goals

**Goals:**
- Validation errors return field-level detail: `{ errors: [{ field, message }] }`
- All business errors in `auth.service.ts` include a `code` string key for i18n
- Error shape is consistent and documented for frontend consumers

**Non-Goals:**
- Frontend translation/i18n integration
- Adding `nestjs-i18n` to the backend
- Translating error messages on the server side
- Adding error codes to non-auth modules (done incrementally as modules are built)

## Decisions

### 1. Fix exception filter: use `getResponse()` not `.message`

For `HttpException`, call `exception.getResponse()` which returns the full object including the validation errors array. Detect if the response contains a `message` array (ValidationPipe shape) and reformat into `{ statusCode, message: "Validation failed", errors: [{ field, message }] }`.

**Alternative considered:** Custom `ValidationPipe` with `exceptionFactory`. Rejected — more invasive and the filter fix achieves the same outcome centrally.

### 2. Error code format: SCREAMING_SNAKE_CASE strings

```
PHONE_ALREADY_EXISTS
PHONE_NOT_FOUND
OTP_INVALID
OTP_EXPIRED
OTP_TOO_MANY_ATTEMPTS
OTP_PURPOSE_MISMATCH
PASSWORD_MISMATCH
INVALID_CREDENTIALS
REFRESH_TOKEN_INVALID
```

Frontend maps these to i18n keys: `t('errors.PHONE_ALREADY_EXISTS')`.

**Alternative considered:** Numeric codes (like HTTP status sub-codes). Rejected — harder to read in logs and debug.

### 3. Error shape for business errors

Services throw with an object payload:
```ts
throw new ConflictException({
  message: 'Phone number already registered',
  code: 'PHONE_ALREADY_EXISTS',
});
```

The filter extracts both `message` and `code` from `getResponse()` and surfaces them:
```json
{
  "statusCode": 409,
  "message": "Phone number already registered",
  "code": "PHONE_ALREADY_EXISTS"
}
```

### 4. Validation error shape

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "password must be longer than or equal to 8 characters" },
    { "field": "phone", "message": "phone must be a valid phone number" }
  ]
}
```

`field` is extracted from the `property` key in `ValidationError`. Nested fields use dot notation (`address.street`).

## Risks / Trade-offs

- **Existing clients reading `message` on 409/404**: Currently they receive the raw exception message string. After this change they still receive `message`, just now it's inside an object payload from `getResponse()`. This is additive — `message` is still present at the same key. Low risk.
- **ValidationPipe message format**: NestJS formats messages as `"<field> <constraint description>"` — not localized. That's acceptable since the frontend will translate by `code` anyway. For validation errors specifically, the `field` name is the key the frontend needs.
- **Auth service throws without `code` today**: All existing throws in auth service will be updated. If any path is missed, the client just won't have a `code` field — graceful degradation.

## Migration Plan

1. Update `AllExceptionsFilter` — affects all endpoints immediately, fully backwards compatible
2. Update auth service errors one by one with `code` fields
3. Update integration tests to assert on `code` fields
4. Document all error codes in `openspec/specs/api-error-responses/spec.md`

No DB migrations, no deployment dependencies. Can be merged and deployed at any time.

## Open Questions

- None — scope is well-defined and isolated to shared filter + auth service.
