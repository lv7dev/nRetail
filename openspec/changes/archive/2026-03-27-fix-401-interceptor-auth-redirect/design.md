## Context

`miniapp/src/services/axios.ts` has a response interceptor that intercepts 401 responses. Its purpose is silent token refresh: when an authenticated request's access token expires, the interceptor refreshes the token pair and retries the original request transparently. If refresh fails or no refresh token exists, it calls `handleAuthFailure()` which clears tokens and redirects to `/login`.

The bug: the interceptor fires on **every** 401, including those from unauthenticated endpoints (`POST /auth/login`, `POST /auth/otp/verify`, `POST /auth/reset-password`). These endpoints return 401 for business reasons (wrong credentials, bad OTP) — they are not session expiry signals. When the interceptor sees these, it finds no refresh token, calls `handleAuthFailure()`, and silently redirects the user to login instead of surfacing the error.

The request interceptor (`axios.ts:31-37`) already provides the signal we need: it attaches `Authorization: Bearer <token>` only when a token exists in storage. Unauthenticated requests have no `Authorization` header.

## Goals / Non-Goals

**Goals:**
- 401 responses on requests without a Bearer token are rejected as normal errors (propagated to TanStack Query `onError`, displayed to user)
- 401 responses on requests with a Bearer token continue to trigger silent refresh + redirect (existing behavior preserved)
- Fix requires no backend changes

**Non-Goals:**
- Handling any other status codes differently
- Changing the backend error taxonomy (401 remains correct for auth failures)
- Adding an endpoint-based skiplist — this is a more fragile approach than checking token presence

## Decisions

### Decision: Check `Authorization` header presence, not URL path

**Alternatives considered:**
- **URL skiplist** (`/auth/login`, `/auth/otp/verify`, etc.): Fragile. Any new unauthenticated endpoint requires updating the list. Easy to miss.
- **Custom config flag** (`config._skipAuth`): Works but requires callers to opt in; silent — error-prone to forget.
- **Change backend status codes** (401 → 400 for auth errors): Semantically wrong. `INVALID_CREDENTIALS` is an authentication failure — 401 is correct. Would mislead API consumers and monitoring.

**Chosen approach:** Check `!!config.headers?.Authorization` in the interceptor. This is self-maintaining — any future unauthenticated request automatically bypasses the redirect logic with no extra code. The request interceptor already manages this header correctly, so we can trust its presence as a reliable signal.

### Decision: Early return without `handleAuthFailure`

When `!wasAuthenticated`, the interceptor returns `Promise.reject(normalizeError(error))` directly — it does not call `handleAuthFailure()`. Calling `handleAuthFailure` would clear tokens and redirect even when the user isn't logged in, which is doubly wrong (no tokens to clear, and redirecting to `/login` from `/login` or `/otp` is nonsensical).

## Risks / Trade-offs

- **Header mutation between request and error handling**: The `config.headers` in the error callback is the same config used to send the request — it reflects the actual headers sent. No race condition risk.
- **Future: Bearer token on auth endpoints**: If a future endpoint requires auth AND uses `UnauthorizedException` for business logic, the interceptor would incorrectly attempt a refresh. Mitigation: the existing `_retry` flag prevents a loop; actual harm is limited to one spurious refresh attempt. Document that business 401s on authenticated endpoints should use a different code (this is currently not a pattern in the codebase).

## Migration Plan

1. Add the `wasAuthenticated` check to the interceptor (one line)
2. Update/add unit tests for the new scenarios
3. No server restart or deploy coordination needed — frontend-only change
4. No rollback complexity — revert the one line if needed
