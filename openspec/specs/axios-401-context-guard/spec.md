## ADDED Requirements

### Requirement: 401 response interceptor only triggers refresh/redirect for authenticated requests
The 401 response interceptor SHALL check whether the original request carried an `Authorization` header before attempting a token refresh or redirecting to login. Requests without a Bearer token (e.g., auth endpoints) SHALL have their 401 errors propagated to the caller normally.

#### Scenario: 401 on unauthenticated request (no Authorization header)
- **WHEN** a request returns 401 AND the original request config has no `Authorization` header
- **THEN** the interceptor SHALL reject with a normalized `ApiError` immediately, without calling `POST /auth/refresh` and without redirecting to `/login`

#### Scenario: 401 on authenticated request (has Authorization header)
- **WHEN** a request returns 401 AND the original request config has an `Authorization: Bearer <token>` header AND the request has not already been retried
- **THEN** the interceptor SHALL attempt the silent token refresh flow (existing behavior)

#### Scenario: Error message reaches caller on unauthenticated 401
- **WHEN** `POST /auth/login` returns 401 with `{ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }`
- **THEN** the mutation's `onError` handler SHALL receive an `ApiError` with `status: 401`, `code: 'INVALID_CREDENTIALS'`

#### Scenario: Error message reaches caller on OTP failure
- **WHEN** `POST /auth/otp/verify` returns 401 with `{ code: 'OTP_INVALID' }`
- **THEN** the caller SHALL receive an `ApiError` with `code: 'OTP_INVALID'` and the user SHALL NOT be redirected to `/login`

#### Scenario: No tokens are cleared on unauthenticated 401
- **WHEN** a request without a Bearer token returns 401
- **THEN** `storage.clearTokens()` SHALL NOT be called and any existing tokens in storage SHALL remain intact
