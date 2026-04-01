# Spec: Prisma Database Connection (Supabase + Prisma v7)

## Requirements

### Requirement: Prisma datasource uses session mode pooler URL

In Prisma v7, `directUrl` is not supported in either `schema.prisma` or `prisma.config.ts`. A single `DATABASE_URL` pointing to Supabase's **session mode pooler** (port 5432) handles both runtime queries and migrations.

#### Scenario: Migrations use session mode pooler
- **WHEN** `prisma migrate deploy` is run with `DATABASE_URL` set to the session mode pooler URL
- **THEN** Prisma connects and applies migrations successfully

#### Scenario: Runtime queries use session mode pooler
- **WHEN** the application makes database queries at runtime
- **THEN** Prisma uses `DATABASE_URL` (session mode pooler, port 5432)

#### Scenario: Local development uses Docker Postgres
- **WHEN** `DATABASE_URL` points to local Docker (`localhost:5434`)
- **THEN** Prisma operates normally for both queries and migrations

### Requirement: Environment template documents Supabase connection format

The `.env.example` file SHALL include `DATABASE_URL` with a comment showing the Supabase session mode pooler URL format.

#### Scenario: Developer sets up production environment
- **WHEN** a developer configures a Supabase-backed deployment
- **THEN** they see the session mode pooler URL format (port 5432) in `.env.example` comments

## Notes

- Prisma v7 removed `directUrl` from both `schema.prisma` and `prisma.config.ts`
- Transaction mode pooler (port 6543, `?pgbouncer=true`) causes migrations to hang — do not use
- Session mode pooler (port 5432) works for both migrations and long-running servers (Render)
- Direct connection (`db.[ref].supabase.co:5432`) may be blocked by ISPs/home networks — use pooler instead
