## ADDED Requirements

### Requirement: E2E spec for register/complete flow
`e2e/auth/register-complete.spec.ts` SHALL cover step 3 of the registration flow (name + password entry) against the real backend.

#### Scenario: Completing registration with valid data navigates to home
- **WHEN** the user arrives at `/register/complete` with valid `phone` and `otpToken` in router state and submits a valid name and password
- **THEN** `POST /auth/register` is called, tokens are stored, and the user is redirected to `/`

#### Scenario: Missing router state redirects to /login
- **WHEN** the user navigates directly to `/register/complete` without router state
- **THEN** the page redirects to `/login` immediately

#### Scenario: Password mismatch shows error
- **WHEN** the user submits with mismatched password and confirm-password fields
- **THEN** a validation error is displayed and no network request is made

### Requirement: E2E spec for logout flow
`e2e/auth/logout.spec.ts` SHALL cover the full logout flow from an authenticated state.

#### Scenario: Logout clears session and redirects to /login
- **WHEN** an authenticated user triggers logout
- **THEN** `POST /auth/logout` is called, tokens are removed from storage, and the user is redirected to `/login`

#### Scenario: After logout, protected routes redirect to /login
- **WHEN** the user attempts to navigate to a protected route after logging out
- **THEN** they are redirected to `/login`

### Requirement: E2E spec for OTP error states
`e2e/auth/otp-errors.spec.ts` SHALL cover error handling during OTP verification for both register and forgot-password flows.

#### Scenario: Wrong OTP code shows error message
- **WHEN** the user enters an incorrect OTP code and submits
- **THEN** an error message is displayed and the user remains on the OTP page

#### Scenario: Expired OTP shows error and allows resend
- **WHEN** the OTP has expired and the user submits
- **THEN** an `OTP_EXPIRED` error message is shown
