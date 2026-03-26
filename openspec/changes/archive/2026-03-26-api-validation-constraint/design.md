## Context

The global `ValidationPipe` in NestJS + class-validator produces `ValidationError` objects. Each `ValidationError` has a `constraints` property — a plain object whose keys are the constraint names (e.g. `minLength`, `isNotEmpty`, `matches`) and values are the human-readable messages.

Currently, `AllExceptionsFilter` detects the old array-of-strings shape from NestJS default ValidationPipe and maps it to `{ field, message }` pairs by splitting on the first space. There is no `constraint` key in the output, so the frontend cannot derive the constraint type for i18n.

Additionally, `RegisterDto.password` and `ResetPasswordDto.newPassword` use `@MinLength(8)`, but the miniapp schemas use `min(6)`. The backend is the authority — the frontend should mirror it, so the mismatch must be resolved in the backend.

## Goals / Non-Goals

**Goals:**
- Emit a `constraint` field in every validation error item so the frontend can do `t('validation.${constraint}')`
- Align `@MinLength` on password fields to `6` (matching the existing frontend schema)
- Keep the filter change backward-compatible: `field` and `message` remain present

**Non-Goals:**
- Frontend translation changes (frontend already has `t('validation.minLength')` etc.)
- Supporting i18n inside the backend — the API remains English-only with codes/constraints for the frontend to translate
- Changing validation behavior for non-auth DTOs at this time

## Decisions

### 1. Custom `exceptionFactory` in `ValidationPipe`

**Decision:** Replace the current default NestJS `ValidationPipe` with one that has a custom `exceptionFactory`. The factory iterates `ValidationError[]`, extracts the first key from each `constraints` object, and throws a `BadRequestException` with a structured payload:

```ts
throw new BadRequestException({
  message: 'Validation failed',
  errors: [
    { field: 'password', constraint: 'minLength', message: 'password must be longer than or equal to 6 characters' }
  ]
})
```

**Why:** class-validator already provides the constraint name as a key in `ValidationError.constraints`. Extracting it here is zero-cost and keeps filter logic simple.

**Alternatives considered:**
- Parsing the human-readable string in the filter (brittle, locale-dependent) — rejected
- Adding constraint metadata via decorator reflection (over-engineered for this use case) — rejected

### 2. `AllExceptionsFilter` reads structured payload, not raw string array

**Decision:** Remove the old "array detection" branch. The filter now reads `exception.getResponse()` and checks for a `{ message, errors }` payload. If `errors` is present, it passes through the full array including `constraint`. No transformation needed in the filter.

**Why:** The responsibility shifts entirely to `exceptionFactory`. The filter becomes a pass-through for structured errors and stays focused on its own concern (HTTP response shape).

### 3. Password min length → 6

**Decision:** Change `@MinLength(8)` to `@MinLength(6)` in `RegisterDto` and `ResetPasswordDto`.

**Why:** The frontend schema already enforces `min(6)`. The backend is the authority on the rule, but the current mismatch causes false rejections — the UI allows a 6-char password and the API rejects it with a confusing error. Minimum 6 characters is consistent with common consumer apps in Vietnam and is enforced by the existing FE schema.

## Risks / Trade-offs

- **Users with 6–7 char passwords**: Any existing user who set a password under the old BE minimum would not exist (the old BE rejected them). No migration needed.
- **`constraints` object order**: We take the first key from `constraints`. class-validator applies decorators in order — the first failing constraint is always meaningful. No risk of wrong constraint name.
- **Nested validation errors**: `ValidationError` can be nested (`children`). Current implementation ignores nested children; this is acceptable as no current DTOs use nested objects with validation.
