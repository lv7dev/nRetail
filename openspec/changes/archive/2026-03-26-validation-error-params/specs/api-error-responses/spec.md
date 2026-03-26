## MODIFIED Requirements

### Requirement: Validation errors expose field-level detail
The system SHALL return structured field-level errors for all `400 Bad Request` responses caused by `ValidationPipe`. The response body SHALL use the shape `{ statusCode, message, errors }` where `errors` is an array of `{ field, constraint, params?, message }` objects. The `field` value SHALL match the DTO property name. The `constraint` value SHALL be the class-validator constraint key in camelCase (e.g. `minLength`, `isNotEmpty`, `matches`). The `params` field, when present, SHALL be a plain object whose keys match i18next interpolation variables for that constraint (e.g. `{ min: 6 }` for `minLength`). The `params` field SHALL be omitted when the constraint has no meaningful parameters (e.g. `isEmail`, `isNotEmpty`). The top-level `message` SHALL be `"Validation failed"`.

#### Scenario: Single field fails validation with numeric constraint
- **WHEN** a request DTO fails validation on one field with a numeric constraint (e.g. `@MinLength(6)` on password)
- **THEN** the response is `400` with `{ message: "Validation failed", errors: [{ field: "password", constraint: "minLength", params: { min: 6 }, message: "<constraint description>" }] }`

#### Scenario: Constraint with no parameters omits params field
- **WHEN** a field fails a constraint that has no parameters (e.g. `@IsEmail()`, `@IsNotEmpty()`)
- **THEN** the error item contains `field` and `constraint` but no `params` property

#### Scenario: Multiple fields fail validation
- **WHEN** a request DTO fails validation on more than one field
- **THEN** all failing fields are listed in the `errors` array, each with a `constraint` key and `params` where applicable

#### Scenario: Non-validation 4xx errors are unaffected
- **WHEN** a service throws a `NotFoundException`, `ConflictException`, etc. (not ValidationPipe)
- **THEN** the response uses the standard `{ statusCode, message, code? }` shape without an `errors` array

#### Scenario: Frontend uses params for i18n interpolation
- **WHEN** the frontend receives `{ errors: [{ field: "password", constraint: "minLength", params: { min: 6 } }] }`
- **THEN** it can render `t('validation.minLength', { min: 6 })` → "Phải có ít nhất 6 ký tự" for any min value without hardcoding rules in the frontend
