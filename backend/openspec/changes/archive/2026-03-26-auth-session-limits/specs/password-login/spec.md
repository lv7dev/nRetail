## MODIFIED Requirements

### Requirement: User can log in with phone and password
The system SHALL authenticate a user via phone number and password. The submitted password SHALL be compared against the bcrypt hash stored in `User.password`. If the user has no password set (`null`), the system SHALL return `401 Unauthorized` with `code: "INVALID_CREDENTIALS"`. On success the system SHALL return a `TokenPair` (`accessToken` + `refreshToken`) and the user record. Failed login attempts SHALL return `401 Unauthorized` with `code: "INVALID_CREDENTIALS"` regardless of whether the phone exists (to prevent user enumeration). `POST /auth/login` SHALL enforce rate limiting of 10 requests per 60-second window per IP; excess requests SHALL return `429 Too Many Requests`.

#### Scenario: Successful login
- **WHEN** `POST /auth/login` is called with a phone that exists and a matching password
- **THEN** the system returns `200 OK` with `accessToken`, `refreshToken`, and the user object

#### Scenario: Login fails with wrong password
- **WHEN** `POST /auth/login` is called with a correct phone but incorrect password
- **THEN** the system returns `401 Unauthorized` with `code: "INVALID_CREDENTIALS"`

#### Scenario: Login fails when user not found
- **WHEN** `POST /auth/login` is called with a phone that has no associated user
- **THEN** the system returns `401 Unauthorized` with `code: "INVALID_CREDENTIALS"`

#### Scenario: Login fails when user has no password set
- **WHEN** `POST /auth/login` is called for a user whose `password` column is null
- **THEN** the system returns `401 Unauthorized` with `code: "INVALID_CREDENTIALS"`

#### Scenario: Login fails with missing fields
- **WHEN** `POST /auth/login` is called without `phone` or `password`
- **THEN** the system returns `400 Bad Request` with field-level `errors` array

#### Scenario: Login rate limit exceeded
- **WHEN** a client sends more than 10 requests to `POST /auth/login` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`
