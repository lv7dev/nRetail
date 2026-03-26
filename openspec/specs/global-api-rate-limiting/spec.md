## Requirements

### Requirement: All API endpoints are rate-limited by default
The system SHALL apply a default rate limit of 100 requests per 60-second window per IP address to every API endpoint. This limit SHALL be configurable via environment variables (`THROTTLE_LIMIT`, `THROTTLE_TTL`). When the limit is exceeded the system SHALL return `429 Too Many Requests`. Individual endpoints MAY override the default limit using per-route configuration.

#### Scenario: Request within global rate limit is allowed
- **WHEN** a client sends fewer than 100 requests to any API endpoint within 60 seconds
- **THEN** each request is processed normally

#### Scenario: Request exceeding global rate limit is rejected
- **WHEN** a client sends more than 100 requests to any API endpoint within 60 seconds
- **THEN** the system returns `429 Too Many Requests`

#### Scenario: New endpoints are protected automatically
- **WHEN** a new controller or route is added to any module
- **THEN** the global rate limit applies without any additional configuration

#### Scenario: Per-route override takes precedence over global default
- **WHEN** an endpoint has a `@Throttle` override configured
- **THEN** the override limit applies instead of the global default
