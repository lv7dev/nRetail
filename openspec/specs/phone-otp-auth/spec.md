## Requirements

### Requirement: User can request an OTP for their phone number
The system SHALL provide two context-aware OTP request endpoints. `POST /auth/otp/register` SHALL only send an OTP if the phone is NOT already in the `User` table; if the phone is already registered it SHALL return `409 Conflict` with `code: "PHONE_ALREADY_EXISTS"`. `POST /auth/otp/forgot-password` SHALL only send an OTP if the phone IS in the `User` table; if no user exists it SHALL return `404 Not Found` with `code: "PHONE_NOT_FOUND"`. In both cases the OTP value SHALL be `PhoneConfig.defaultOtp` if a config row exists for the phone, otherwise `'999999'`. The OTP SHALL be hashed and stored in `OtpVerification` with a 5-minute expiry and a `purpose` column set to `'register'` or `'reset'` respectively. Any previous unverified OTP for the same phone SHALL be deleted before storing the new one. The raw OTP SHALL NOT appear in the API response.

#### Scenario: Register OTP request for new phone
- **WHEN** `POST /auth/otp/register` is called with a phone that has no associated `User` record
- **THEN** the system stores a hashed OTP with `purpose = 'register'` and 5-minute expiry and returns `200 OK`

#### Scenario: Register OTP request blocked for existing user
- **WHEN** `POST /auth/otp/register` is called with a phone that already has an associated `User` record
- **THEN** the system returns `409 Conflict` with `code: "PHONE_ALREADY_EXISTS"` without creating an OTP

#### Scenario: Forgot-password OTP request for existing user
- **WHEN** `POST /auth/otp/forgot-password` is called with a phone that has an associated `User` record
- **THEN** the system stores a hashed OTP with `purpose = 'reset'` and 5-minute expiry and returns `200 OK`

#### Scenario: Forgot-password OTP request blocked for unknown phone
- **WHEN** `POST /auth/otp/forgot-password` is called with a phone that has no associated `User` record
- **THEN** the system returns `404 Not Found` with `code: "PHONE_NOT_FOUND"` without creating an OTP

#### Scenario: PhoneConfig defaultOtp is used when configured
- **WHEN** either OTP request endpoint is called with a phone that has a `PhoneConfig` row with a non-null `defaultOtp`
- **THEN** the system stores a hashed OTP derived from `PhoneConfig.defaultOtp`

#### Scenario: 999999 is used as fallback when no PhoneConfig entry
- **WHEN** either OTP request endpoint is called with a phone that has no `PhoneConfig` row (or row has null `defaultOtp`)
- **THEN** the system stores a hashed OTP derived from `'999999'`

#### Scenario: Previous OTP is replaced on new request
- **WHEN** either OTP request endpoint is called for a phone that already has a pending OTP
- **THEN** the old `OtpVerification` record is deleted and a new one is created

#### Scenario: OTP is never returned in the response
- **WHEN** either OTP request endpoint succeeds
- **THEN** the response body SHALL NOT contain the OTP value

### Requirement: System validates OTP and issues a phone-ownership token
The system SHALL verify the submitted OTP against the stored hash via `POST /auth/otp/verify`. Expiry, attempt counting, and bcrypt comparison logic are unchanged. On successful verification the `OtpVerification` record SHALL be deleted and the system SHALL return a short-lived `otpToken` JWT containing `{ phone, purpose }` expiring in 5 minutes. The system SHALL NOT return auth tokens (`accessToken` / `refreshToken`) directly from this endpoint. Error responses SHALL include a machine-readable `code` field.

#### Scenario: Correct OTP returns otpToken
- **WHEN** `POST /auth/otp/verify` is called with a valid, unexpired OTP
- **THEN** the `OtpVerification` record is deleted and the response contains an `otpToken` JWT with `{ phone, purpose }` and no `accessToken` or `refreshToken`

#### Scenario: otpToken purpose matches the originating OTP request endpoint
- **WHEN** OTP was created via `POST /auth/otp/register`
- **THEN** the `otpToken` contains `purpose = 'register'`

#### Scenario: otpToken purpose is reset for forgot-password flow
- **WHEN** OTP was created via `POST /auth/otp/forgot-password`
- **THEN** the `otpToken` contains `purpose = 'reset'`

#### Scenario: Wrong OTP returns code OTP_INVALID
- **WHEN** `POST /auth/otp/verify` is called with an incorrect OTP and attempts < 3
- **THEN** the system increments `OtpVerification.attempts` and returns `401 Unauthorized` with `code: "OTP_INVALID"`

#### Scenario: OTP blocked after 3 failed attempts returns code OTP_INVALID
- **WHEN** `POST /auth/otp/verify` is called and `OtpVerification.attempts` is already 3
- **THEN** the system returns `401 Unauthorized` with `code: "OTP_INVALID"` without comparing the OTP hash

#### Scenario: Expired OTP returns code OTP_EXPIRED
- **WHEN** `POST /auth/otp/verify` is called after the OTP's `expiresAt` has passed
- **THEN** the system returns `401 Unauthorized` with `code: "OTP_EXPIRED"` without incrementing attempts

#### Scenario: OTP cannot be reused after success
- **WHEN** `POST /auth/otp/verify` is called a second time with the same phone after a prior success
- **THEN** the system returns `401 Unauthorized` with `code: "OTP_INVALID"` (record was deleted on first success)

### Requirement: Phone number format is validated at the DTO layer
The system SHALL reject any request to `/auth/otp/register`, `/auth/otp/forgot-password`, or `/auth/otp/verify` where the `phone` field does not match Vietnamese local format (`/^0[0-9]{9}$/` — 10 digits, leading zero). Invalid phone values SHALL return `400 Bad Request` with a field-level validation error before any business logic runs.

#### Scenario: Valid phone format is accepted
- **WHEN** any OTP endpoint is called with a phone matching `/^0[0-9]{9}$/` (e.g. `0901234567`)
- **THEN** the request proceeds past DTO validation

#### Scenario: Invalid phone format is rejected
- **WHEN** any OTP endpoint is called with a phone that does not match the pattern (e.g. `+84901234567`, `123`, `hello`)
- **THEN** the system returns `400 Bad Request` with `errors: [{ field: "phone", constraint: "matches" }]`

### Requirement: OTP value is validated as exactly 6 digits at the DTO layer
The system SHALL reject any request to `/auth/otp/verify` where the `otp` field is not exactly 6 numeric digits (`/^[0-9]{6}$/`). Invalid OTP values SHALL return `400 Bad Request` with a field-level validation error before any OTP lookup runs.

#### Scenario: Valid OTP format is accepted
- **WHEN** `POST /auth/otp/verify` is called with an `otp` of exactly 6 digits (e.g. `999999`)
- **THEN** the request proceeds past DTO validation

#### Scenario: Non-digit OTP is rejected
- **WHEN** `POST /auth/otp/verify` is called with an `otp` containing non-digit characters (e.g. `abc123`, `12345!`)
- **THEN** the system returns `400 Bad Request` with `errors: [{ field: "otp", constraint: "matches" }]`

#### Scenario: Wrong-length OTP is rejected
- **WHEN** `POST /auth/otp/verify` is called with an `otp` of fewer or more than 6 digits (e.g. `12345`, `1234567`)
- **THEN** the system returns `400 Bad Request` with `errors: [{ field: "otp", constraint: "matches" }]`
