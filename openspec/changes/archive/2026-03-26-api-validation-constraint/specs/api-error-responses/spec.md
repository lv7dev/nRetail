## MODIFIED Requirements

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
