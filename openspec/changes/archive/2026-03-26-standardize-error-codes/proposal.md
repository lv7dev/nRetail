## Why

The `ThrottlerGuard` returns a raw `"ThrottlerException: Too Many Requests"` string with no `code` field, breaking the project's contract that every error response must carry a machine-readable `code` for frontend i18n. More broadly, the contract is only enforced by convention in service-layer code — `AllExceptionsFilter` passes through whatever the exception carries, so any exception thrown outside the service layer (guards, interceptors, middleware) can silently omit `code`.

## What Changes

- Extend `AllExceptionsFilter` to detect `ThrottlerException` (status 429) and inject `code: 'RATE_LIMIT_EXCEEDED'` automatically — no change needed in any controller or service
- Add `RATE_LIMIT_EXCEEDED` to the error code registry in the `api-error-responses` spec
- Codify the rule: **every error response the API emits must include a `code` field** — guards, filters, and middleware are not exempt

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `api-error-responses`: Extend "Business errors include a machine-readable code" requirement to cover 429 rate-limit errors. Add `RATE_LIMIT_EXCEEDED` to the error code registry. Add explicit rule that all error-emitting layers (guards, filters, middleware) must attach `code`.

## Impact

- `src/shared/filters/http-exception.filter.ts`: Add ThrottlerException detection branch
- `openspec/specs/api-error-responses/spec.md`: Add `RATE_LIMIT_EXCEEDED` to registry and extend the coverage rule
- No breaking changes to existing error response shapes
- No controller or service changes needed
