## Why

Deploying the backend to Render with Supabase as the managed PostgreSQL provider requires two separate database connection strings: one through PgBouncer (connection pooling) for runtime queries, and one direct connection for Prisma migrations. Currently `prisma.config.ts` only has `url`, which breaks migrations when pointed at a pooled endpoint.

## What Changes

- Add `directUrl` field to the datasource config in `prisma.config.ts`, reading from a `DIRECT_URL` env var
- Add `DIRECT_URL` to `.env.example` with documentation explaining the difference

## Capabilities

### New Capabilities
- `prisma-dual-url`: Prisma datasource configured with both a pooled connection URL (for runtime) and a direct URL (for migrations), enabling Supabase PgBouncer compatibility

### Modified Capabilities

## Impact

- `backend/prisma.config.ts` — datasource block gains `directUrl`
- `backend/.env.example` — new `DIRECT_URL` variable added with comments
- No schema.prisma changes (datasource URL config lives in prisma.config.ts)
- No application runtime behavior changes — only migration tooling is affected
