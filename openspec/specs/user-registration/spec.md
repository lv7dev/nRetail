## Requirements

### Requirement: New user can register with phone and name after OTP verification
The system SHALL allow a new user to register by providing a `registrationToken` (issued by OTP verify) and a `name`. The `registrationToken` SHALL be a JWT signed with the app secret, containing the verified phone, expiring in 5 minutes. On valid submission the system SHALL create a `User` record with the phone, name, and role `CUSTOMER`, insert the phone into `PhoneConfig`, and return `accessToken` and `refreshToken`.

#### Scenario: Successful registration
- **WHEN** `POST /auth/register` is called with a valid `registrationToken` and a non-empty `name`
- **THEN** a new `User` is created with `role = CUSTOMER`, the phone is added to `PhoneConfig`, and the response contains `accessToken`, `refreshToken`, and the new user object

#### Scenario: Registration fails with expired registrationToken
- **WHEN** `POST /auth/register` is called with a `registrationToken` that has expired (> 5 min old)
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Registration fails with missing name
- **WHEN** `POST /auth/register` is called without a `name` field or with an empty string
- **THEN** the system returns `400 Bad Request`

#### Scenario: Registration fails if phone already registered
- **WHEN** `POST /auth/register` is called with a `registrationToken` for a phone that already has a `User` record
- **THEN** the system returns `409 Conflict`

#### Scenario: registrationToken cannot be used twice
- **WHEN** `POST /auth/register` is called a second time with the same `registrationToken`
- **THEN** the system returns `409 Conflict` (phone already has a user)
