## Requirements

### Requirement: Access token is a short-lived JWT
The system SHALL issue a JWT access token valid for 15 minutes. The payload SHALL contain `sub` (userId), `phone`, and `role`. All protected endpoints SHALL verify this token via `JwtAuthGuard`. An expired or invalid token SHALL result in `401 Unauthorized`.

#### Scenario: Protected endpoint rejects missing token
- **WHEN** a request to a JWT-protected endpoint is made without an `Authorization` header
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Protected endpoint rejects expired token
- **WHEN** a request is made with a JWT whose `exp` is in the past
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Protected endpoint accepts valid token
- **WHEN** a request is made with a valid, unexpired JWT in `Authorization: Bearer <token>`
- **THEN** the request proceeds and `@CurrentUser()` resolves to the authenticated user

### Requirement: Refresh token enables silent session renewal
The system SHALL issue an opaque refresh token (32 random bytes, hex-encoded) alongside the access token. The raw token SHALL be returned to the client once and never stored — only its bcrypt hash is persisted in `RefreshToken`. The refresh token SHALL expire in 30 days.

#### Scenario: Successful token refresh
- **WHEN** `POST /auth/refresh` is called with a valid, unexpired refresh token
- **THEN** the old `RefreshToken` record is deleted, a new refresh token is generated and stored, and the response contains a new `accessToken` and `refreshToken`

#### Scenario: Refresh fails with invalid token
- **WHEN** `POST /auth/refresh` is called with a token that does not match any stored hash
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Refresh fails with expired token
- **WHEN** `POST /auth/refresh` is called with a token whose `expiresAt` has passed
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Reuse of rotated refresh token triggers full invalidation
- **WHEN** `POST /auth/refresh` is called with a refresh token that was already rotated (deleted from DB)
- **THEN** the system returns `401 Unauthorized` and deletes ALL refresh tokens for that user

### Requirement: Logout invalidates the current session
The system SHALL allow an authenticated user to logout by presenting their refresh token. The matching `RefreshToken` record SHALL be deleted. The access token remains valid until its natural expiry (stateless — no blocklist).

#### Scenario: Successful logout
- **WHEN** `POST /auth/logout` is called with a valid JWT and the matching `refreshToken` in the body
- **THEN** the `RefreshToken` record is deleted and the system returns `204 No Content`

#### Scenario: Logout with unknown refresh token still succeeds
- **WHEN** `POST /auth/logout` is called but the refresh token is not found in DB
- **THEN** the system returns `204 No Content` (idempotent)
