## ADDED Requirements

### Requirement: E2E test folder structure and shared fixtures
`miniapp/e2e/auth/` contains one spec file per auth flow. `miniapp/e2e/fixtures/auth.ts` exports shared helpers: `seedUser`, `loginAs`, and `setExpiredAccessToken`. All E2E tests run against the real NestJS backend and a real test database.

#### Scenario: Fixtures are importable from any spec file
- **WHEN** a spec file imports from `../fixtures/auth`
- **THEN** `seedUser`, `loginAs`, and `setExpiredAccessToken` are available and typed

### Requirement: Flow 1 — New user registration
`e2e/auth/register.spec.ts` covers the complete registration path.

#### Scenario: Successful registration navigates to home
- **WHEN** the user visits `/register`, enters a valid phone, submits, enters the correct OTP on `/otp`, completes the profile on `/register/complete`, and submits
- **THEN** the user lands on `/` (home) in an authenticated state

#### Scenario: Duplicate phone shows error
- **WHEN** the user attempts to register with a phone that is already registered
- **THEN** an error message is visible on the register page

### Requirement: Flow 2 — Login with existing credentials
`e2e/auth/login.spec.ts` covers the login path.

#### Scenario: Valid credentials navigate to home
- **WHEN** a known user visits `/login`, enters correct phone and password, and submits
- **THEN** the user lands on `/`

#### Scenario: Invalid credentials show error, stay on login
- **WHEN** the user submits wrong credentials
- **THEN** an error message is visible and the URL remains `/login`

### Requirement: Flow 3 — Forgot password reset
`e2e/auth/forgot-password.spec.ts` covers the password reset path.

#### Scenario: Successful reset allows login with new password
- **WHEN** the user visits `/forgot-password`, enters their phone, submits, enters the correct OTP on `/otp`, sets a new password on `/new-password`, and submits
- **THEN** the user is redirected to `/login` and can log in with the new password

### Requirement: Flow 4 — Unauthenticated route guard
`e2e/auth/route-guard.spec.ts` covers redirect behaviour.

#### Scenario: Unauthenticated visit to protected route redirects to login
- **WHEN** an unauthenticated user navigates directly to `/`
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated user visiting /login is not redirected
- **WHEN** an authenticated user navigates to `/login`
- **THEN** they remain on `/login` (no forced redirect away from auth pages)

### Requirement: Flow 10 — Silent token auto-refresh
`e2e/auth/token-refresh.spec.ts` covers the interceptor's refresh behaviour.

#### Scenario: Expired access token is silently refreshed
- **WHEN** `setExpiredAccessToken(page, validRefreshToken)` is called and the user navigates to a protected page
- **THEN** the page loads successfully without redirecting to `/login`, and a new access token is present in localStorage

### Requirement: Flow 11 — Forced logout on invalid refresh token
`e2e/auth/token-refresh.spec.ts` also covers the forced logout case.

#### Scenario: Invalid refresh token causes forced logout
- **WHEN** both `localStorage.accessToken` and `localStorage.refreshToken` are set to invalid strings and the user navigates to a protected page
- **THEN** `POST /auth/refresh` fails, localStorage is cleared, and the user is redirected to `/login`
