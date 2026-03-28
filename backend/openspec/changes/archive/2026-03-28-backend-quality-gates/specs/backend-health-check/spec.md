## ADDED Requirements

### Requirement: Health check endpoint
The backend SHALL expose a `GET /health` endpoint that is publicly accessible (no JWT required) and returns the liveness status of the application and its database connection.

#### Scenario: DB is reachable — returns 200 ok
- **WHEN** `GET /health` is called and Postgres is reachable
- **THEN** the response is `200` with body `{ "status": "ok", "db": "ok" }`

#### Scenario: DB is unreachable — returns 503
- **WHEN** `GET /health` is called and Postgres is not reachable
- **THEN** the response is `503` with body `{ "status": "error", "db": "error", "error": "<message>" }`

### Requirement: Health module is isolated
The `HealthModule` SHALL be a standalone NestJS module that does not depend on any feature modules (auth, users). It depends only on `PrismaModule`.

#### Scenario: Health module registers without feature module dependencies
- **WHEN** the NestJS application bootstraps
- **THEN** `HealthModule` is registered in `AppModule` and resolves without importing `AuthModule` or `UsersModule`

### Requirement: Health check is excluded from global auth guard
The `/health` endpoint SHALL be accessible without a Bearer token. The route MUST be decorated with `@Public()` or equivalent to bypass `JwtAuthGuard`.

#### Scenario: Unauthenticated request succeeds
- **WHEN** `GET /health` is called without an `Authorization` header
- **THEN** the response is `200` (not `401`)
