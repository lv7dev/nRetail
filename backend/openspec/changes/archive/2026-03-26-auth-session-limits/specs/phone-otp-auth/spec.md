## MODIFIED Requirements

### Requirement: User can request an OTP for their phone number
The system SHALL provide two context-aware OTP request endpoints. `POST /auth/otp/register` SHALL only send an OTP if the phone is NOT already in the `User` table; if the phone is already registered it SHALL return `409 Conflict` with `code: "PHONE_ALREADY_EXISTS"`. `POST /auth/otp/forgot-password` SHALL only send an OTP if the phone IS in the `User` table; if no user exists it SHALL return `404 Not Found` with `code: "PHONE_NOT_FOUND"`. In both cases the OTP value SHALL be `PhoneConfig.defaultOtp` if a config row exists for the phone, otherwise `'999999'`. The OTP SHALL be hashed and stored in `OtpVerification` with a 5-minute expiry and a `purpose` column set to `'register'` or `'reset'` respectively. Any previous unverified OTP for the same phone SHALL be deleted before storing the new one. The raw OTP SHALL NOT appear in the API response. Both endpoints SHALL enforce rate limiting of 10 requests per 60-second window per IP; excess requests SHALL return `429 Too Many Requests`.

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

#### Scenario: OTP register rate limit exceeded
- **WHEN** a client sends more than 10 requests to `POST /auth/otp/register` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: OTP forgot-password rate limit exceeded
- **WHEN** a client sends more than 10 requests to `POST /auth/otp/forgot-password` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`
