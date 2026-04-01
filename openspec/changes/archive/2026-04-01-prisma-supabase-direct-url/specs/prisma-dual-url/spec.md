## ADDED Requirements

### Requirement: Prisma datasource uses dual connection URLs
The datasource configuration SHALL support both a pooled `url` (for runtime queries) and a `directUrl` (for migrations), read from `DATABASE_URL` and `DIRECT_URL` environment variables respectively.

#### Scenario: Migrations use direct connection
- **WHEN** `prisma migrate deploy` is run with both `DATABASE_URL` and `DIRECT_URL` set
- **THEN** Prisma uses `DIRECT_URL` for the migration connection, bypassing PgBouncer

#### Scenario: Runtime queries use pooled connection
- **WHEN** the application makes database queries at runtime
- **THEN** Prisma uses `DATABASE_URL` (the pooled PgBouncer endpoint)

#### Scenario: Local development with single URL
- **WHEN** only `DATABASE_URL` is set (no `DIRECT_URL`)
- **THEN** Prisma operates normally using `DATABASE_URL` for both queries and migrations

### Requirement: Environment template documents both connection vars
The `.env.example` file SHALL include both `DATABASE_URL` and `DIRECT_URL` with inline comments explaining when each is required.

#### Scenario: Developer sets up production environment
- **WHEN** a developer copies `.env.example` to configure a Supabase-backed deployment
- **THEN** they see clear documentation that `DIRECT_URL` must be set to the non-pooled Supabase connection string
