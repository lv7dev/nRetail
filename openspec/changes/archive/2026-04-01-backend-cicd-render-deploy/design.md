## Context

The backend (`backend/`) is a NestJS 11 app in a monorepo. It has no CI/CD. Developers currently push directly to `main`. The app is deployed to Render (free plan Web Service) with Supabase (session mode pooler) as the database.

Integration tests already work locally — `global-setup.ts` spins up a `postgres:15-alpine` Docker container on port 5433, runs `prisma migrate deploy`, and sets all required env vars. GitHub Actions `ubuntu-latest` runners have Docker available, so the existing test setup requires no changes to run in CI.

`REDIS_URL` is required by config schema validation but no module currently connects to Redis. The env var is set by `global-setup.ts` so config validation passes in tests.

## Goals / Non-Goals

**Goals:**
- Lint and test backend on every PR and every merge to `main`
- Auto-deploy to Render only after CI passes on `main`
- Enforce branch workflow: feature branches + PRs, never direct push to `main`
- Run database migrations on every Render deploy

**Non-Goals:**
- Miniapp CI/CD (separate discussion)
- E2E (Playwright) tests in CI — require full stack, deferred
- Test coverage enforcement in CI — `test:cov` at 100% is too slow for every PR
- Redis/BullMQ in CI — not used yet; add when needed

## Decisions

### D1: Path-scoped workflow trigger

**Decision**: Trigger the backend workflow only on `paths: ['backend/**']`.

**Rationale**: Monorepo — miniapp changes should not trigger backend CI. Avoids wasted CI minutes and false deploys.

**Alternative considered**: Single workflow for everything — rejected, too coupled.

---

### D2: Render auto-deploy via "After CI checks pass" (not deploy hook)

**Decision**: Use Render's native "After CI checks pass" auto-deploy setting, not a `curl` deploy hook step in the workflow.

**Rationale**: Cleaner — no secret to manage. Render watches GitHub commit status automatically. The workflow only needs to run tests and report pass/fail; Render handles the deploy trigger.

**Alternative considered**: `curl $RENDER_DEPLOY_HOOK_URL` in a deploy job — rejected, unnecessary complexity.

---

### D3: Migrations in start command (not pre-deploy)

**Decision**: Start command: `npx prisma migrate deploy && node dist/main`

**Rationale**: Render free plan has no pre-deploy command. Baking migration into the start command is fail-safe — if migration fails, the app never starts and Render marks the deploy as failed. No risk of the app starting on a broken schema.

**Alternative considered**: Run migrations from GitHub Actions via Supabase direct connection — possible (GHA runners aren't blocked by ISP), but adds complexity and a Supabase secret to manage. Rejected for simplicity.

---

### D4: `lint:check` script for CI, keep `lint` for local

**Decision**: Add `"lint:check": "eslint \"{src,apps,libs,test}/**/*.ts\""` (no `--fix`). CI uses `lint:check`; developers use `lint` locally.

**Rationale**: `eslint --fix` in CI silently masks violations — it fixes files then exits 0, but the fixed version is never committed. CI must fail on violations, not auto-fix them.

---

### D5: Integration tests in CI (Docker Postgres, no Supabase)

**Decision**: Run `npm run test:integration` in CI using the existing Docker-based setup.

**Rationale**: `ubuntu-latest` runners have Docker. The `global-setup.ts` handles container lifecycle automatically. No changes to test code needed. Docker Postgres catches ~95% of meaningful bugs (SQL correctness, Prisma behavior, migration correctness, business logic). The remaining gap (pooler edge cases, Supabase-specific extensions) is infrastructure-level, not logic bugs, and this project doesn't use RLS or Supabase-specific features.

---

### D6: CI job order — lint before tests

**Decision**: `lint:check` → `npm test` → `npm run test:integration`

**Rationale**: Fail fast. Lint is fast (~5s). Unit tests are faster than integration tests (~30s vs ~2min). Catch cheap issues before expensive ones.

## Risks / Trade-offs

- **Migration on every cold start** → If Render spins the free instance down and back up (no traffic), `prisma migrate deploy` runs again on wake. This is idempotent (Prisma skips already-applied migrations) and adds ~1-2s to cold start. Acceptable.
- **Free plan cold starts (~30s)** → User accepted this. Will upgrade plan when needed.
- **Integration tests add ~2 min to CI** → Acceptable tradeoff for the coverage they provide.
- **Branch protection bypasses for admin** → Set "Do not allow bypassing" so even admins can't push directly to `main`.

## Open Questions

- None — all decisions made during explore session.
