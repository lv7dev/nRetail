## ADDED Requirements

### Requirement: MSW installed and configured for Vitest
MSW (`msw` package) is installed as a devDependency. A `src/mocks/server.ts` sets up a Node-mode MSW server used across all integration tests. A `src/mocks/handlers/auth.ts` exports default handlers for all auth endpoints. The Vitest setup file initialises the server before all tests and resets handlers after each test.

#### Scenario: MSW server lifecycle in integration tests
- **WHEN** a `*.integration.test.tsx` file runs
- **THEN** the MSW server is started before the suite, handlers are reset after each test, and the server is closed after the suite

### Requirement: Separate npm script for integration tests
A `test:integration` npm script runs only `*.integration.test.tsx` files via Vitest with the `--include` glob `**/*.integration.test.tsx`. The existing `test` script continues to run only `*.test.tsx` files (no integration tests included).

#### Scenario: Running unit tests only
- **WHEN** `npm run test` is executed
- **THEN** only `*.test.tsx` and `*.test.ts` files run; `*.integration.test.tsx` files are excluded

#### Scenario: Running integration tests only
- **WHEN** `npm run test:integration` is executed
- **THEN** only `*.integration.test.tsx` files run; `*.test.tsx` unit test files are excluded

### Requirement: Axios interceptor integration tests
`src/services/axios.integration.test.ts` covers the full interceptor behaviour using MSW to simulate real HTTP responses. Tests use the actual `apiClient` instance.

#### Scenario: Successful request injects Bearer token
- **WHEN** `storage.setTokens('access-token', 'refresh-token')` is called and a GET request is made via `apiClient`
- **THEN** the outgoing request has `Authorization: Bearer access-token`

#### Scenario: Silent token refresh on 401 for authenticated request
- **WHEN** an authenticated request returns 401 and `POST /auth/refresh` returns a new token pair
- **THEN** the original request is retried with the new access token and succeeds

#### Scenario: Forced logout when refresh token is missing
- **WHEN** an authenticated request returns 401 and no refresh token is in storage
- **THEN** `storage.clearTokens()` is called and `window.location` is set to `/login`

#### Scenario: Forced logout when refresh endpoint returns 401
- **WHEN** an authenticated request returns 401 and `POST /auth/refresh` also returns 401
- **THEN** `storage.clearTokens()` is called and the user is redirected to `/login`

#### Scenario: Concurrent 401s use a single refresh call
- **WHEN** two authenticated requests simultaneously return 401
- **THEN** only one `POST /auth/refresh` call is made; both original requests are retried with the new token

#### Scenario: Unauthenticated 401 is not treated as session expiry
- **WHEN** a request without an `Authorization` header returns 401
- **THEN** the error propagates as an `ApiError` and no redirect occurs

### Requirement: Auth page integration tests with MSW
Each of the 5 auth pages has a co-located `*.integration.test.tsx` file that tests the real form → axios → MSW handler → UI response flow without mocking the service layer.

#### Scenario: Login page — successful login redirects to home
- **WHEN** the user fills valid credentials and submits
- **THEN** `POST /auth/login` is called (intercepted by MSW returning a token pair) and the router navigates to `/`

#### Scenario: Login page — API error displays translated message
- **WHEN** MSW returns `{ code: "INVALID_CREDENTIALS" }` on POST /auth/login
- **THEN** the error message for `INVALID_CREDENTIALS` is shown in the form

#### Scenario: Register page — submitting phone requests OTP and navigates to /otp
- **WHEN** the user enters a phone number and submits
- **THEN** `POST /auth/otp/register` is called and the router navigates to `/otp`

#### Scenario: OTP page — correct code navigates to next step
- **WHEN** the user enters the 6-digit OTP
- **THEN** `POST /auth/otp/verify` is called and navigation proceeds (to `/register/complete` or `/new-password` depending on purpose)

#### Scenario: ForgotPassword page — submitting phone requests OTP
- **WHEN** the user enters their phone number
- **THEN** `POST /auth/otp/forgot-password` is called and the router navigates to `/otp`

#### Scenario: NewPassword page — submitting new password resets and redirects to login
- **WHEN** the user submits a valid new password with a valid OTP token in router state
- **THEN** `POST /auth/reset-password` is called and navigation goes to `/login`
