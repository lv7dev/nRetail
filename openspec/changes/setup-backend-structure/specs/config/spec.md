## ADDED Requirements

### Requirement: Typed environment config with startup validation
The app SHALL validate all required environment variables at startup using a Zod schema. If any required variable is missing or has the wrong type, the app SHALL throw an error and refuse to start.

#### Scenario: All required env vars present
- **WHEN** the app starts with a complete, valid `.env`
- **THEN** the app SHALL start successfully and `ConfigService` SHALL return typed values

#### Scenario: A required env var is missing
- **WHEN** the app starts without `DATABASE_URL` (or any other required var)
- **THEN** the app SHALL throw a descriptive error and exit before accepting any requests

---

### Requirement: `ConfigModule` is global
`ConfigModule` SHALL be registered with `isGlobal: true` so that `ConfigService` can be injected into any module without re-importing `ConfigModule`.

#### Scenario: Injecting ConfigService in a feature module
- **WHEN** a service in `modules/products/` injects `ConfigService`
- **THEN** it SHALL receive the config values without `ConfigModule` being listed in that module's imports

---

### Requirement: Required environment variables
The following variables SHALL be validated by the config schema:

| Variable | Type | Required |
|---|---|---|
| `PORT` | number | no (default: 3000) |
| `NODE_ENV` | `development` \| `production` \| `test` | no (default: `development`) |
| `DATABASE_URL` | string (URL) | yes |
| `REDIS_URL` | string (URL) | yes |
| `JWT_SECRET` | string (min 32 chars) | yes |
| `JWT_EXPIRES_IN` | string | no (default: `7d`) |
