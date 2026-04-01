## ADDED Requirements

### Requirement: Render auto-deploys after CI passes on main
Render SHALL be configured to auto-deploy the backend Web Service only after GitHub CI checks pass on the `main` branch (not on every commit).

#### Scenario: CI passes on main → Render deploys
- **WHEN** the backend CI workflow reports success on a push to `main`
- **THEN** Render triggers a new deploy automatically

#### Scenario: CI fails on main → Render does not deploy
- **WHEN** the backend CI workflow reports failure on a push to `main`
- **THEN** Render does NOT trigger a deploy

### Requirement: Render Web Service is configured for NestJS
The Render Web Service SHALL use the following configuration:

| Field | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm ci && npm run build` |
| Start command | `npx prisma migrate deploy && node dist/main` |
| Health check path | `/health` |
| Auto-deploy | After CI checks pass |

#### Scenario: App starts successfully with valid env vars
- **WHEN** Render starts the service with all required env vars set
- **THEN** `prisma migrate deploy` runs (idempotent), `node dist/main` starts, and `/health` returns 200

### Requirement: Prisma migrations run on every deploy start
Because Render free plan has no pre-deploy command, migrations SHALL be part of the start command: `npx prisma migrate deploy && node dist/main`.

#### Scenario: No pending migrations
- **WHEN** Render starts the app and no new migrations exist
- **THEN** `prisma migrate deploy` exits 0 immediately and the app starts normally

#### Scenario: Pending migration exists
- **WHEN** Render starts the app and a new migration is pending
- **THEN** `prisma migrate deploy` applies it and the app starts

#### Scenario: Migration fails
- **WHEN** `prisma migrate deploy` exits non-zero
- **THEN** `node dist/main` does NOT start and Render marks the deploy as failed

### Requirement: Render environment variables are configured
All required env vars SHALL be set in the Render dashboard (not committed to the repo).

Required variables: `NODE_ENV`, `DATABASE_URL` (Supabase session pooler), `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `REGISTRATION_TOKEN_EXPIRES_IN`, `THROTTLE_LIMIT`, `THROTTLE_TTL`.

#### Scenario: Missing required env var
- **WHEN** a required env var is absent
- **THEN** the app refuses to start (Zod config validation throws at bootstrap)
