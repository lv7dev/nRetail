## Requirements

### Requirement: User model stores phone, name, and role
The system SHALL persist users with a unique phone number, a required name, and a role (default `CUSTOMER`). Valid roles are `ADMIN`, `STAFF`, `CUSTOMER`.

#### Scenario: Two users cannot share a phone number
- **WHEN** a registration attempt is made with a phone that already exists in the `User` table
- **THEN** the system returns `409 Conflict`

#### Scenario: User role defaults to CUSTOMER on registration
- **WHEN** a new user is created via `POST /auth/register`
- **THEN** the user's role is set to `CUSTOMER`

### Requirement: Authenticated user can retrieve their own profile
The system SHALL expose `GET /auth/me` protected by `JwtAuthGuard`. It SHALL return the current user's `id`, `phone`, `name`, `role`, and `createdAt`. Sensitive fields (e.g. hashed tokens) SHALL NOT be included.

#### Scenario: Authenticated user gets their profile
- **WHEN** `GET /auth/me` is called with a valid JWT
- **THEN** the response contains the user's `id`, `phone`, `name`, `role`, and `createdAt`

#### Scenario: Unauthenticated request is rejected
- **WHEN** `GET /auth/me` is called without a valid JWT
- **THEN** the system returns `401 Unauthorized`
