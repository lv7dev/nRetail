## Requirements

### Requirement: Validation errors expose field-level detail
The system SHALL return structured field-level errors for all `400 Bad Request` responses caused by `ValidationPipe`. The response body SHALL use the shape `{ statusCode, message, errors }` where `errors` is an array of `{ field, constraint, message }` objects. The `field` value SHALL match the DTO property name. The `constraint` value SHALL be the class-validator constraint key in camelCase (e.g. `minLength`, `isNotEmpty`, `matches`). The top-level `message` SHALL be `"Validation failed"`.

#### Scenario: Single field fails validation
- **WHEN** a request DTO fails validation on one field (e.g. password too short)
- **THEN** the response is `400` with `{ message: "Validation failed", errors: [{ field: "password", constraint: "minLength", message: "<constraint description>" }] }`

#### Scenario: Multiple fields fail validation
- **WHEN** a request DTO fails validation on more than one field
- **THEN** all failing fields are listed in the `errors` array, each with a `constraint` key

#### Scenario: Non-validation 4xx errors are unaffected
- **WHEN** a service throws a `NotFoundException`, `ConflictException`, etc. (not ValidationPipe)
- **THEN** the response uses the standard `{ statusCode, message, code? }` shape without an `errors` array

#### Scenario: Frontend uses constraint for i18n
- **WHEN** the frontend receives `{ errors: [{ field: "password", constraint: "minLength" }] }`
- **THEN** it can render `t('validation.minLength', { min: 6 })` regardless of the English `message` string

### Requirement: Business errors include a machine-readable code
The system SHALL include a `code` field (SCREAMING_SNAKE_CASE string) in all 4xx business error responses. This `code` SHALL be stable across releases and usable by the frontend as an i18n translation key. The English `message` field SHALL also be present alongside `code`.

#### Scenario: Business error response shape
- **WHEN** an endpoint returns a 4xx business error (e.g. 409 Conflict)
- **THEN** the response body contains both `message` (English string) and `code` (SCREAMING_SNAKE_CASE key)

#### Scenario: Frontend can map code to translation
- **WHEN** the frontend receives `{ code: "PHONE_ALREADY_EXISTS" }`
- **THEN** it can look up `t('errors.PHONE_ALREADY_EXISTS')` independently of the English `message`

### Requirement: Error code registry
The system SHALL define and maintain a stable set of error codes for all auth-related business errors:

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

#### Scenario: Code is present on every auth business error
- **WHEN** any auth endpoint returns a 4xx response for a business rule violation
- **THEN** the response contains a `code` field from the registry above
