### Requirement: JWT-protected endpoints are annotated for Swagger UI

Every controller method that uses `@UseGuards(JwtAuthGuard)` SHALL also carry `@ApiBearerAuth()` so that Swagger UI displays the lock icon and includes the `Authorization: Bearer <token>` header in requests for that endpoint.

#### Scenario: Protected endpoint shows lock icon in Swagger UI

- **WHEN** a controller method has both `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`
- **THEN** Swagger UI displays a lock icon next to that endpoint

#### Scenario: Authenticated request succeeds via Swagger UI

- **WHEN** a user enters a valid access token in the Swagger "Authorize" dialog
- **AND** calls a `@ApiBearerAuth()`-annotated endpoint
- **THEN** Swagger UI sends the `Authorization: Bearer <token>` header
- **AND** the server responds with 200 (not 401)

#### Scenario: Unannotated protected endpoint is forbidden

- **WHEN** a controller method uses `@UseGuards(JwtAuthGuard)` without `@ApiBearerAuth()`
- **THEN** this is considered a defect — Swagger UI will not attach the token and the endpoint will return 401 even with a valid token in the Authorize dialog

### Requirement: Public endpoints are not marked as requiring auth

Controller methods that do NOT use `@UseGuards(JwtAuthGuard)` SHALL NOT carry `@ApiBearerAuth()`.

#### Scenario: Public endpoint has no lock icon

- **WHEN** a controller method has no `@UseGuards(JwtAuthGuard)` decorator
- **THEN** Swagger UI displays no lock icon for that endpoint
- **AND** requests are sent without any `Authorization` header
