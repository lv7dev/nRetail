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

### Requirement: E2E folder has its own tsconfig for Node types
`miniapp/e2e/tsconfig.json` SHALL exist, extend the root `tsconfig.json`, include `@types/node` in its types array, and cover the `e2e/` directory. This allows E2E files to use Node APIs (`process.env`, `require`, `import` from `pg`, etc.) without polluting the browser-targeted `src/` tsconfig.

#### Scenario: E2E global-setup uses ESM imports without type errors
- **WHEN** `e2e/global-setup.ts` uses `import { Client } from 'pg'`
- **THEN** the TypeScript compiler SHALL resolve the types without error

#### Scenario: E2E spec files resolve Playwright types
- **WHEN** any file in `e2e/` imports from `@playwright/test`
- **THEN** the types SHALL resolve correctly under `e2e/tsconfig.json`

#### Scenario: Node globals not available in src/
- **WHEN** a file under `src/` references `process.env` or `require`
- **THEN** the TypeScript compiler SHALL NOT resolve these as Node globals (no node types in src tsconfig)

### Requirement: AuthProvider integration test with MSW
`src/components/AuthProvider.integration.test.tsx` SHALL exist alongside the existing auth page integration tests. It uses the real axios client intercepted by MSW and tests the full rehydration lifecycle without mocking at the service or store layer.

#### Scenario: Successful rehydration renders children with user in store
- **WHEN** an access token is in localStorage and `GET /auth/me` is handled by MSW with a valid user response
- **THEN** the auth store user is set and the children of `AuthProvider` are rendered

#### Scenario: Failed rehydration clears auth and renders children
- **WHEN** an access token is in localStorage and `GET /auth/me` returns 401
- **THEN** the auth store user is null, isReady is true, and children are rendered

#### Scenario: No token skips network call and marks ready
- **WHEN** no access token is present in localStorage
- **THEN** no GET /auth/me request is made and children render immediately with isReady true

### Requirement: register/complete integration test with MSW
`src/pages/auth/register/RegisterComplete.integration.test.tsx` SHALL exist alongside the existing register integration test. It exercises the step-3 name+password form using real axios + TanStack Query + MSW, without mocking the service layer.

#### Scenario: Successful submission stores tokens, sets auth, navigates to /
- **WHEN** valid form data is submitted with a valid otpToken in router state and MSW handles `POST /auth/register`
- **THEN** tokens appear in localStorage, the auth store has the user, and navigation proceeds to `/`

#### Scenario: Server error displays translated message
- **WHEN** MSW returns `{ code: 'PASSWORD_MISMATCH' }` on `POST /auth/register`
- **THEN** the translated error message is visible in the form

#### Scenario: Missing router state redirects without calling API
- **WHEN** the page mounts without valid router state
- **THEN** the page redirects to `/login` and no `POST /auth/register` request is made
