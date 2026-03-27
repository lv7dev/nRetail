## ADDED Requirements

### Requirement: Axios instance as the single HTTP gateway
The app SHALL provide a configured Axios instance at `src/services/axios.ts` as the single HTTP client for all outbound API requests. Raw `fetch` calls and the previous `src/services/api.ts` wrapper SHALL be replaced by this instance.

#### Scenario: Successful request via Axios instance
- **WHEN** a service calls the Axios instance with a valid path and the server returns 2xx
- **THEN** the instance SHALL return the parsed response data typed to the caller's expected type

#### Scenario: Base URL from environment variable
- **WHEN** `VITE_API_BASE_URL` is set at build time
- **THEN** all requests via the instance SHALL be prefixed with that URL

---

### Requirement: Request interceptor injects Bearer token
The Axios instance SHALL include a request interceptor that reads the current access token from `nativeStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request.

#### Scenario: Token present in storage
- **WHEN** `nativeStorage.getItem('accessToken')` returns a non-empty string
- **THEN** the outgoing request SHALL include `Authorization: Bearer <token>` in its headers

#### Scenario: No token in storage
- **WHEN** `nativeStorage.getItem('accessToken')` returns null or empty
- **THEN** the request SHALL be sent without an Authorization header

---

### Requirement: Response interceptor handles 401 with silent refresh
The Axios instance SHALL include a response interceptor that attempts a silent token refresh when a 401 response is received, then retries the original request.

#### Scenario: 401 received on first attempt
- **WHEN** a request returns 401 AND a refresh token exists in `nativeStorage` AND the request has not already been retried
- **THEN** the interceptor SHALL call `POST /auth/refresh` with the stored refresh token, store the new tokens, and retry the original request with the new access token

#### Scenario: Refresh succeeds
- **WHEN** `POST /auth/refresh` returns new tokens
- **THEN** both `accessToken` and `refreshToken` SHALL be written to `nativeStorage` and the original request SHALL be retried transparently

#### Scenario: Refresh fails
- **WHEN** `POST /auth/refresh` returns an error or the user has no refresh token
- **THEN** `clearAuth()` SHALL be called and the user SHALL be redirected to `/login`

#### Scenario: Infinite loop prevention
- **WHEN** a request has already been retried (flagged via `config._retry`)
- **THEN** the interceptor SHALL not attempt another refresh and SHALL reject with the original error

#### Scenario: Concurrent 401 responses
- **WHEN** two or more requests return 401 simultaneously
- **THEN** only one refresh call SHALL be made; all waiting requests SHALL retry with the new token once refresh completes

---

### Requirement: Response interceptor normalizes errors
The Axios instance SHALL extract `{ message, code }` from all error responses and throw a typed `ApiError` so callers receive a consistent error shape regardless of HTTP status.

#### Scenario: Backend returns structured error
- **WHEN** the server responds with 4xx/5xx and a body containing `{ message, code }`
- **THEN** the interceptor SHALL throw `ApiError { status, message, code }` for callers to handle

#### Scenario: Non-structured error response
- **WHEN** the server responds with an error and the body cannot be parsed
- **THEN** the interceptor SHALL throw `ApiError { status, message: 'Unknown error', code: undefined }`
