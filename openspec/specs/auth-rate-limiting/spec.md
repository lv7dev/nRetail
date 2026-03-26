## Requirements

### Requirement: Auth endpoints are rate-limited per IP
The system SHALL apply rate limiting to `POST /auth/login`, `POST /auth/otp/register`, and `POST /auth/otp/forgot-password`. The limit SHALL be 10 requests per 60-second window per IP address. When the limit is exceeded the system SHALL return `429 Too Many Requests`. The limit values SHALL be configurable via environment variables (`THROTTLE_AUTH_LIMIT`, `THROTTLE_AUTH_TTL`).

#### Scenario: Request within rate limit is allowed
- **WHEN** a client sends fewer than 10 requests to `POST /auth/login` within 60 seconds
- **THEN** each request is processed normally

#### Scenario: Request exceeding rate limit is rejected
- **WHEN** a client sends more than 10 requests to `POST /auth/login` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: Rate limit applies to OTP register endpoint
- **WHEN** a client sends more than 10 requests to `POST /auth/otp/register` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: Rate limit applies to OTP forgot-password endpoint
- **WHEN** a client sends more than 10 requests to `POST /auth/otp/forgot-password` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: Endpoints not requiring rate limiting are unaffected
- **WHEN** a client calls `POST /auth/refresh` or `POST /auth/logout` any number of times
- **THEN** no rate limit is applied (these require a valid token already)
