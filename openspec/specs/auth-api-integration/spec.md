## ADDED Requirements

### Requirement: Login flow connects to backend
The login page SHALL call `POST /auth/login` with `{ phone, password }`, store the returned tokens, and navigate to home on success.

#### Scenario: Successful login
- **WHEN** user submits valid phone and password
- **THEN** the app SHALL call `POST /auth/login`, receive `{ accessToken, refreshToken, user }`, store tokens via `storage.setTokens()` (platform-aware), set user in `useAuthStore`, and navigate to `/`

#### Scenario: Invalid credentials
- **WHEN** `POST /auth/login` returns 401 with `code: INVALID_CREDENTIALS`
- **THEN** the login form SHALL display the resolved error message and remain on the login page

#### Scenario: Submit button disabled during request
- **WHEN** the login mutation is pending (`isPending === true`)
- **THEN** the submit button SHALL show a loading spinner and be non-interactive

---

### Requirement: Register flow is 3 steps — phone, OTP, complete form
Registration SHALL be split across three routes: `/register` (phone input), `/otp` (OTP entry), and `/register/complete` (name + password).

#### Scenario: Step 1 — phone submission
- **WHEN** user submits a valid phone number on `/register`
- **THEN** the app SHALL call `POST /auth/otp/register` and navigate to `/otp` with `state: { flow: 'register', phone }`

#### Scenario: Phone already registered
- **WHEN** `POST /auth/otp/register` returns 409 with `code: PHONE_ALREADY_EXISTS`
- **THEN** the register page SHALL display the resolved error message

#### Scenario: Step 2 — OTP verification
- **WHEN** user enters the 6-digit code on `/otp`
- **THEN** the app SHALL call `POST /auth/otp/verify { phone, otp }`, receive `{ otpToken }`, and navigate to `/register/complete` with `state: { phone, otpToken }`

#### Scenario: Invalid OTP
- **WHEN** `POST /auth/otp/verify` returns 401 with `code: OTP_INVALID` or `OTP_EXPIRED`
- **THEN** the OTP page SHALL display the resolved error message

#### Scenario: Step 3 — complete registration
- **WHEN** user submits name, password, and confirmPassword on `/register/complete`
- **THEN** the app SHALL call `POST /auth/register { otpToken, name, password, confirmPassword }`, receive tokens and user, store them, and navigate to `/`

#### Scenario: Missing router state guard
- **WHEN** user navigates directly to `/register/complete` without `otpToken` in router state
- **THEN** the page SHALL redirect to `/login`

---

### Requirement: Forgot-password flow is 3 steps — phone, OTP, new password
Password reset SHALL be split across three routes: `/forgot-password` (phone), `/otp` (OTP entry), `/new-password` (new password form).

#### Scenario: Step 1 — phone submission
- **WHEN** user submits their phone on `/forgot-password`
- **THEN** the app SHALL call `POST /auth/otp/forgot-password` and navigate to `/otp` with `state: { flow: 'forgot', phone }`

#### Scenario: Phone not found
- **WHEN** `POST /auth/otp/forgot-password` returns 404 with `code: PHONE_NOT_FOUND`
- **THEN** the forgot-password page SHALL display the resolved error message

#### Scenario: Step 2 — OTP verification
- **WHEN** user enters the 6-digit code on `/otp` in the forgot flow
- **THEN** the app SHALL call `POST /auth/otp/verify`, receive `{ otpToken }`, and navigate to `/new-password` with `state: { phone, otpToken }`

#### Scenario: Step 3 — new password submission
- **WHEN** user submits new password and confirmation on `/new-password`
- **THEN** the app SHALL call `POST /auth/reset-password { otpToken, newPassword, confirmPassword }` and navigate to `/login` on success

#### Scenario: Missing otpToken guard on new-password page
- **WHEN** user navigates directly to `/new-password` without `otpToken` in router state
- **THEN** the page SHALL redirect to `/login`

---

### Requirement: OTP resend is flow-aware
The OTP page SHALL support resending the OTP using the correct endpoint based on the current flow.

#### Scenario: Resend in register flow
- **WHEN** user clicks "Resend" on `/otp` with `state.flow === 'register'`
- **THEN** the app SHALL call `POST /auth/otp/register { phone }` and show a success message

#### Scenario: Resend in forgot-password flow
- **WHEN** user clicks "Resend" on `/otp` with `state.flow === 'forgot'`
- **THEN** the app SHALL call `POST /auth/otp/forgot-password { phone }` and show a success message

---

### Requirement: Logout clears session
Logout SHALL invalidate the server-side refresh token and clear all local auth state.

#### Scenario: Successful logout
- **WHEN** user triggers logout
- **THEN** the app SHALL call `POST /auth/logout` with the stored refresh token, then call `clearAuth()` and navigate to `/login`

#### Scenario: Logout on network failure
- **WHEN** `POST /auth/logout` fails (network error or 401)
- **THEN** the app SHALL still call `clearAuth()` and navigate to `/login` (best-effort server invalidation)

---

### Requirement: Button shows loading state during form submission
Every form submit button tied to an API call SHALL reflect the mutation's `isPending` state.

#### Scenario: Mutation is pending
- **WHEN** a form mutation's `isPending` is `true`
- **THEN** the submit button SHALL display a loading spinner, be visually dimmed, and not respond to clicks

#### Scenario: Mutation completes
- **WHEN** the mutation resolves (success or error)
- **THEN** the submit button SHALL return to its normal interactive state
