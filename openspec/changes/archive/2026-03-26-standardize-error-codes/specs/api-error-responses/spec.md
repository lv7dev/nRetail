## MODIFIED Requirements

### Requirement: Business errors include a machine-readable code
The system SHALL include a `code` field (SCREAMING_SNAKE_CASE string) in **all** error responses, including those emitted by guards, filters, and middleware — not only service-layer exceptions. This `code` SHALL be stable across releases and usable by the frontend as an i18n translation key. The English `message` field SHALL also be present alongside `code`. Any layer of the system that emits an error response is responsible for ensuring `code` is present; `AllExceptionsFilter` is the enforcement point for any exception that does not already carry a `code`.

#### Scenario: Business error response shape
- **WHEN** an endpoint returns a 4xx business error (e.g. 409 Conflict)
- **THEN** the response body contains both `message` (English string) and `code` (SCREAMING_SNAKE_CASE key)

#### Scenario: Frontend can map code to translation
- **WHEN** the frontend receives `{ code: "PHONE_ALREADY_EXISTS" }`
- **THEN** it can look up `t('errors.PHONE_ALREADY_EXISTS')` independently of the English `message`

#### Scenario: Rate limit error includes code
- **WHEN** a client exceeds the rate limit and receives a 429 response
- **THEN** the response body contains `code: "RATE_LIMIT_EXCEEDED"` alongside `message` and `statusCode`

#### Scenario: Guard-emitted errors include code
- **WHEN** any guard (e.g. ThrottlerGuard) throws an exception that reaches AllExceptionsFilter
- **THEN** the filter injects a `code` field if the exception does not already carry one

### Requirement: Error code registry
The system SHALL define and maintain a stable set of error codes for all auth-related and infrastructure business errors:

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `PHONE_ALREADY_EXISTS` | 409 | Phone is already registered |
| `PHONE_NOT_FOUND` | 404 | Phone has no user account |
| `OTP_INVALID` | 401 | OTP code is wrong or too many attempts |
| `OTP_EXPIRED` | 401 | OTP has passed its 5-minute expiry |
| `OTP_PURPOSE_MISMATCH` | 401 | otpToken purpose doesn't match the endpoint |
| `INVALID_CREDENTIALS` | 401 | Phone/password combination is wrong |
| `PASSWORD_MISMATCH` | 400 | newPassword and confirmPassword differ |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token not found or already used |
| `RATE_LIMIT_EXCEEDED` | 429 | Client has exceeded the request rate limit |

#### Scenario: Code is present on every auth business error
- **WHEN** any auth endpoint returns a 4xx response for a business rule violation
- **THEN** the response contains a `code` field from the registry above

#### Scenario: Rate limit code is present on 429 responses
- **WHEN** any endpoint returns 429 Too Many Requests
- **THEN** the response contains `code: "RATE_LIMIT_EXCEEDED"`
