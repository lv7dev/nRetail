## ADDED Requirements

### Requirement: Phone number format is validated at the login DTO layer
The system SHALL reject any request to `/auth/login` where the `phone` field does not match Vietnamese local format (`/^0[0-9]{9}$/`). Invalid phone values SHALL return `400 Bad Request` with a field-level validation error.

#### Scenario: Invalid phone format rejected at login
- **WHEN** `POST /auth/login` is called with a phone that does not match `/^0[0-9]{9}$/`
- **THEN** the system returns `400 Bad Request` with `errors: [{ field: "phone", constraint: "matches" }]`
