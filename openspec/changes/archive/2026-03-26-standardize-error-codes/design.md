## Context

`AllExceptionsFilter` currently passes through whatever `exception.getResponse()` returns. For service-layer exceptions (`ConflictException`, `UnauthorizedException`, etc.) this works because the code manually attaches `code` to the payload. But `ThrottlerException.getResponse()` returns the plain string `"ThrottlerException: Too Many Requests"` — the filter hits the "plain string" branch and emits no `code` field.

The fix is minimal: detect the `ThrottlerException` case in the filter and inject `code: 'RATE_LIMIT_EXCEEDED'` before responding. No guard subclassing, no new files.

## Goals / Non-Goals

**Goals:**
- 429 responses always include `code: 'RATE_LIMIT_EXCEEDED'`
- The filter is the single enforcement point — no scattered guard subclassing
- The rule "every error response must have `code`" is documented and enforceable

**Non-Goals:**
- Per-endpoint rate limit codes (e.g. `LOGIN_RATE_LIMIT_EXCEEDED`) — a generic code is sufficient for frontend i18n; the `path` field already tells the frontend which endpoint was hit if it needs to differentiate
- Middleware or WebSocket error normalization — out of scope

## Decisions

### D1 — Detect ThrottlerException in AllExceptionsFilter, not a custom guard subclass

**Decision:** Import `ThrottlerException` from `@nestjs/throttler` and add an early-return branch in `AllExceptionsFilter` that injects `code: 'RATE_LIMIT_EXCEEDED'`.

**Why:** The filter is already the "normalize everything" layer. A custom guard subclass adds a new file, requires updating `AppModule`, and duplicates the response-shaping logic that already lives in the filter.

**Alternative considered:** Subclass `ThrottlerGuard`, override `throwThrottlingException()`, throw `new HttpException({ message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }, 429)`. Rejected — more boilerplate, and the filter already handles structured `HttpException` payloads, so both approaches end at the same place.

### D2 — Single generic code `RATE_LIMIT_EXCEEDED` for all 429s

**Decision:** All throttled routes return `code: 'RATE_LIMIT_EXCEEDED'` regardless of which endpoint was hit.

**Why:** The frontend can display a generic "Too many requests, please wait" message. The `path` field in the response body already identifies the endpoint if the frontend needs to render more specific copy. Per-endpoint codes would require the filter to inspect `request.url` and maintain a mapping — fragile and premature.

### D3 — Add the rule to the spec, not just to CLAUDE.md

**Decision:** Add a formal requirement to `api-error-responses` spec: "The `code` field SHALL be present on all error responses, including those emitted by guards and filters."

**Why:** CLAUDE.md is developer guidance. The spec is the contract. Having it in the spec means future requirements changes (e.g. adding per-route codes) are tracked through the OpenSpec change process.

## Risks / Trade-offs

- **`ThrottlerException` import couples the filter to `@nestjs/throttler`** → Acceptable — the dependency is already a first-class part of the app. If throttler is ever swapped out, the filter needs updating anyway.
- **`code` could be missing on other guard-thrown exceptions in the future** → Mitigated by the spec rule (D3) and by documenting the convention in `backend/CLAUDE.md` under Error Handling.

## Migration Plan

1. Update `AllExceptionsFilter` — add `ThrottlerException` detection branch
2. Update `api-error-responses` delta spec — add `RATE_LIMIT_EXCEEDED` and the coverage rule
3. Add a test to `http-exception.filter.spec.ts` covering the 429 + `code` case
4. Update `backend/CLAUDE.md` Error Handling section with the rule

## Open Questions

_(none)_
