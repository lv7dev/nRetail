## MODIFIED Requirements

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
| `CORS_ORIGINS` | string (comma-separated URLs) | yes |

#### Scenario: CORS_ORIGINS present and valid
- **WHEN** the app starts with `CORS_ORIGINS=https://h5.zdn.vn,http://localhost:3000`
- **THEN** `ConfigService.get('CORS_ORIGINS')` SHALL return a non-empty string and the backend SHALL split it into an array of allowed origins

#### Scenario: CORS_ORIGINS missing
- **WHEN** the app starts without `CORS_ORIGINS` set
- **THEN** the Zod schema SHALL throw a descriptive validation error and the app SHALL refuse to start
