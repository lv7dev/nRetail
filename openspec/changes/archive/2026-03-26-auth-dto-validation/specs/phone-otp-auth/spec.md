## ADDED Requirements

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
