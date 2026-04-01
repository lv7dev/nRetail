## Context

The backend uses Prisma 6 with a `prisma.config.ts` file (introduced in Prisma 6) to configure the datasource programmatically. Currently only `url` is set, pointing to `DATABASE_URL`. When deploying to Render + Supabase, the `DATABASE_URL` will point to Supabase's PgBouncer pooled endpoint (`?pgbouncer=true`), which does not support Prisma's migration commands. A separate direct (non-pooled) connection is required for `prisma migrate deploy`.

## Goals / Non-Goals

**Goals:**
- Add `directUrl` to `prisma.config.ts` so migrations use the direct Postgres connection
- Document both env vars in `.env.example` so developers know to configure both in production

**Non-Goals:**
- Configuring Supabase itself (outside repo scope)
- Changing Render deployment config
- Adding connection pooling at the application level (PgBouncer handles this)

## Decisions

### Use `prisma.config.ts` for directUrl, not schema.prisma

Prisma 6 supports datasource config in `prisma.config.ts`. This project already uses that pattern for `url`. Keeping `directUrl` there too is consistent and avoids splitting config across two files.

Alternative: add `directUrl = env("DIRECT_URL")` directly to `schema.prisma` datasource block. This works in Prisma 5 and 6, but conflicts with the existing `prisma.config.ts` approach.

### Keep directUrl optional in development

`DIRECT_URL` defaults to `DATABASE_URL` if not set. In local dev both point to the same Docker Postgres — no separate direct URL needed. In production (Supabase), both must be set explicitly.

## Risks / Trade-offs

- [Risk] Developer forgets to set `DIRECT_URL` in production → migration fails at deploy time  
  Mitigation: Document clearly in `.env.example` with a comment explaining when it's required

- [Risk] Future Prisma major version changes config API → `prisma.config.ts` approach may need updating  
  Mitigation: Low risk; Prisma 6 committed to this API. Monitor Prisma release notes.
