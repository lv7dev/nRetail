## Why

The Axios response interceptor treats every 401 response as a "session expired" signal, immediately redirecting the user to `/login`. This is wrong for auth endpoints (`/auth/login`, `/auth/otp/verify`, `/auth/reset-password`) which return 401 for business errors (wrong OTP, invalid credentials) on requests that never carry a Bearer token — causing silent redirects instead of surfacing the error message to the user.

## What Changes

- The 401 interceptor gains a context check: if the original request carried no `Authorization` header, the 401 is treated as a regular error and rejected normally (so TanStack Query's `onError` can display it), not as a session expiry requiring a refresh.
- No change to `handleAuthFailure` behavior for authenticated requests (session expiry flow is preserved as-is).
- No change to backend error codes or HTTP status codes — they remain semantically correct.

## Capabilities

### New Capabilities
- `axios-401-context-guard`: The 401 refresh/redirect logic only fires on authenticated requests; unauthenticated requests propagate 401 errors to callers normally.

### Modified Capabilities
- `axios-client`: The silent-refresh scenario gains a precondition — the request must have an Authorization header for refresh/redirect to trigger.

## Impact

- **`miniapp/src/services/axios.ts`** — response interceptor logic (one condition added)
- **`miniapp/src/services/axios.test.ts`** (or co-located test) — new test scenarios for the context guard
- No backend changes
- No changes to `storage.ts`, `apiError.ts`, or any page/hook
