## MODIFIED Requirements

### Requirement: New user can register with phone, name, and password after OTP verification
The system SHALL allow a new user to register by providing an `otpToken` (issued by `POST /auth/otp/verify`), a `name`, a `password`, and a `confirmPassword`. The `otpToken` SHALL be validated — it MUST have `purpose = 'register'`, otherwise the system SHALL return `401 Unauthorized`. The `password` and `confirmPassword` fields MUST match, otherwise the system SHALL return `400 Bad Request`. On valid submission the system SHALL create a `User` record with the phone, name, role `CUSTOMER`, and a bcrypt hash of the password. The system SHALL then return `accessToken`, `refreshToken`, and the new user object. The system SHALL NOT insert the phone into `PhoneConfig` — that table is managed manually.

#### Scenario: Successful registration
- **WHEN** `POST /auth/register` is called with a valid `otpToken` (purpose=register), a non-empty `name`, and matching `password` and `confirmPassword`
- **THEN** a new `User` is created with `role = CUSTOMER` and a bcrypt-hashed password, and the response contains `accessToken`, `refreshToken`, and the new user object

#### Scenario: Registration fails with expired otpToken
- **WHEN** `POST /auth/register` is called with an `otpToken` that has expired (> 5 min old)
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Registration fails with wrong purpose
- **WHEN** `POST /auth/register` is called with an `otpToken` that has `purpose = 'reset'`
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Registration fails when passwords do not match
- **WHEN** `POST /auth/register` is called with `password !== confirmPassword`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Registration fails with missing name
- **WHEN** `POST /auth/register` is called without a `name` field or with an empty string
- **THEN** the system returns `400 Bad Request`

#### Scenario: Registration fails if phone already registered
- **WHEN** `POST /auth/register` is called with an `otpToken` for a phone that already has a `User` record
- **THEN** the system returns `409 Conflict`

#### Scenario: otpToken cannot be used twice
- **WHEN** `POST /auth/register` is called a second time with the same `otpToken` for a phone that was just registered
- **THEN** the system returns `409 Conflict` (phone already has a user)
