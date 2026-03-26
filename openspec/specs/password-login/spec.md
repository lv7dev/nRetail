## Requirements

### Requirement: User can log in with phone and password
The system SHALL authenticate a user via phone number and password. The submitted password SHALL be compared against the bcrypt hash stored in `User.password`. If the user has no password set (`null`), the system SHALL return `401 Unauthorized`. On success the system SHALL return a `TokenPair` (`accessToken` + `refreshToken`) and the user record.

#### Scenario: Successful login
- **WHEN** `POST /auth/login` is called with a phone that exists and a matching password
- **THEN** the system returns `200 OK` with `accessToken`, `refreshToken`, and the user object

#### Scenario: Login fails with wrong password
- **WHEN** `POST /auth/login` is called with a correct phone but incorrect password
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Login fails when user not found
- **WHEN** `POST /auth/login` is called with a phone that has no associated user
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Login fails when user has no password set
- **WHEN** `POST /auth/login` is called for a user whose `password` column is null
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Login fails with missing fields
- **WHEN** `POST /auth/login` is called without `phone` or `password`
- **THEN** the system returns `400 Bad Request`

### Requirement: User can reset their password via OTP verification
The system SHALL allow a user to set a new password after proving phone ownership via OTP. The reset request SHALL require an `otpToken` (issued by `POST /auth/otp/verify`) with `purpose = 'reset'`. The `newPassword` and `confirmPassword` fields MUST match. The new password SHALL be bcrypt-hashed and stored in `User.password`. On success the system SHALL return a `TokenPair` and the user record (logging the user in immediately).

#### Scenario: Successful password reset
- **WHEN** `POST /auth/reset-password` is called with a valid `otpToken` (purpose=reset), matching `newPassword` and `confirmPassword`
- **THEN** the user's password is updated and the system returns `200 OK` with `accessToken`, `refreshToken`, and user

#### Scenario: Reset fails when otpToken has wrong purpose
- **WHEN** `POST /auth/reset-password` is called with an `otpToken` that has `purpose = 'register'`
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Reset fails when passwords do not match
- **WHEN** `POST /auth/reset-password` is called with `newPassword !== confirmPassword`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Reset fails with expired otpToken
- **WHEN** `POST /auth/reset-password` is called with an `otpToken` that has expired (> 5 min old)
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Reset fails when user not found
- **WHEN** `POST /auth/reset-password` is called with a valid `otpToken` but the phone no longer has an associated user
- **THEN** the system returns `401 Unauthorized`
