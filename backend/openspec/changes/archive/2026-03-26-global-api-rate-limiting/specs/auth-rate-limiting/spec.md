## MODIFIED Requirements

### Requirement: Auth endpoints are rate-limited per IP
The system SHALL apply rate limiting to `POST /auth/login`, `POST /auth/otp/register`, and `POST /auth/otp/forgot-password` via per-route overrides on the global throttle guard. `POST /auth/login` SHALL be limited to 10 requests per 60-second window per IP. `POST /auth/otp/register` and `POST /auth/otp/forgot-password` SHALL each be limited to 6 requests per 300-second window per IP (aligned with OTP TTL). When the limit is exceeded the system SHALL return `429 Too Many Requests`.

#### Scenario: Login within rate limit is allowed
- **WHEN** a client sends fewer than 10 requests to `POST /auth/login` within 60 seconds
- **THEN** each request is processed normally

#### Scenario: Login rate limit exceeded
- **WHEN** a client sends more than 10 requests to `POST /auth/login` within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: OTP register rate limit exceeded
- **WHEN** a client sends more than 6 requests to `POST /auth/otp/register` within 300 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: OTP forgot-password rate limit exceeded
- **WHEN** a client sends more than 6 requests to `POST /auth/otp/forgot-password` within 300 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: Endpoints not requiring strict rate limiting use global default
- **WHEN** a client calls `POST /auth/refresh`, `POST /auth/logout`, or `GET /auth/me`
- **THEN** the global default rate limit (100/60s) applies
