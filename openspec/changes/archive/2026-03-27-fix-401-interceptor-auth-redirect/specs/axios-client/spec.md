## MODIFIED Requirements

### Requirement: Response interceptor handles 401 with silent refresh
The Axios instance SHALL include a response interceptor that attempts a silent token refresh when a 401 response is received on an **authenticated request**, then retries the original request. Requests that carry no `Authorization` header SHALL have their 401 errors rejected normally without attempting refresh.

#### Scenario: 401 received on authenticated request (first attempt)
- **WHEN** a request returns 401 AND the original request config has an `Authorization` header AND a refresh token exists in storage AND the request has not already been retried
- **THEN** the interceptor SHALL call `POST /auth/refresh` with the stored refresh token, store the new tokens, and retry the original request with the new access token

#### Scenario: 401 received on unauthenticated request
- **WHEN** a request returns 401 AND the original request config has no `Authorization` header
- **THEN** the interceptor SHALL reject with a normalized `ApiError` immediately, without calling `POST /auth/refresh` and without redirecting to `/login`

#### Scenario: Refresh succeeds
- **WHEN** `POST /auth/refresh` returns new tokens
- **THEN** both `accessToken` and `refreshToken` SHALL be written to storage and the original request SHALL be retried transparently

#### Scenario: Refresh fails
- **WHEN** `POST /auth/refresh` returns an error or the user has no refresh token (on an authenticated request)
- **THEN** `clearAuth()` SHALL be called and the user SHALL be redirected to `/login`

#### Scenario: Infinite loop prevention
- **WHEN** a request has already been retried (flagged via `config._retry`)
- **THEN** the interceptor SHALL not attempt another refresh and SHALL reject with the original error

#### Scenario: Concurrent 401 responses
- **WHEN** two or more authenticated requests return 401 simultaneously
- **THEN** only one refresh call SHALL be made; all waiting requests SHALL retry with the new token once refresh completes
