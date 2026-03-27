## Context

The project currently has unit tests (Vitest for miniapp, Jest for backend) but two layers are missing:
- **Integration tests**: unit tests mock everything; no test exercises the real axios interceptor or NestJS controller-to-DB path
- **E2E tests**: Playwright is installed and configured but the `e2e/` folder is empty

Tests are also written alongside implementation in the same commit, not before it. This blocks true TDD (red → green → refactor).

The frontend already has Playwright, Vitest, and React Testing Library. The backend has Jest and supertest. Neither has MSW or a real-DB test harness yet.

## Goals / Non-Goals

**Goals:**
- Three independently runnable test tiers: unit (fast, no I/O), integration (MSW / real DB), E2E (full stack)
- Pure TDD enforced by convention: failing test commit precedes implementation commit
- Full auth flow coverage at every tier
- Minimal infrastructure complexity — no Kubernetes, no test containers library, plain Docker Compose for the test DB

**Non-Goals:**
- CI pipeline changes (follow-up)
- Coverage thresholds or enforcement tooling (follow-up)
- Testing pages beyond auth (future features add their own tests as built)
- Backend E2E tests (covered by frontend E2E hitting real backend)

## Decisions

### D1: MSW for frontend integration tests (not Playwright mocking)

MSW intercepts at the service worker / Node fetch layer, so the real `apiClient` (axios instance, interceptors, token injection) runs in tests. Playwright's `page.route()` is for E2E only. Vitest runs MSW in Node mode (`setupServer` from `msw/node`), no service worker needed.

### D2: File naming convention for frontend integration tests

Co-locate integration tests as `*.integration.test.tsx` next to source. Two separate Vitest invocations:
- `npm run test` — matches `**/*.test.tsx` (excludes `*.integration.test.tsx`)
- `npm run test:integration` — matches `**/*.integration.test.tsx`

Both share the same `vite.config.mts` but with different `include` globs passed via CLI flag, avoiding a second config file.

### D3: Backend integration tests in `test/` (NestJS convention)

Separate `test/` folder at `backend/test/` with its own `jest-integration.config.ts`. The existing `jest` config in `package.json` stays untouched (unit tests unaffected). Integration config points `rootDir` to `test/` and runs `*.integration.spec.ts`.

### D4: Real Docker Postgres for backend integration tests (not SQLite)

Production uses Postgres with Prisma. SQLite diverges on JSON operators, enum types, and trigger behaviour. A dedicated `test_nretail` database on a Docker-managed Postgres instance is the right trade-off. Global setup script starts the container (or reuses existing), runs `prisma migrate deploy`, and tears down after the suite.

### D5: E2E runs against real backend (Option A)

Playwright tests start both the miniapp dev server and the NestJS backend. Auth flows seed a test user via the API (POST /auth/otp/register flow or a direct DB seed). Token flows 10–11 manipulate `localStorage` via `page.evaluate()` to simulate expired/invalid tokens.

### D6: Test fixture pattern for E2E

Shared `e2e/fixtures/auth.ts` exports:
- `seedUser(request)` — calls API to create a known test user
- `loginAs(page, phone, password)` — performs login and returns page in authenticated state
- `setExpiredAccessToken(page, refreshToken)` — writes fake expired JWT + real refresh token to localStorage

### D7: Pure TDD convention documented in CLAUDE.md, not enforced by git hooks

Git hooks can be bypassed with `--no-verify`. Convention documented clearly in CLAUDE.md is sufficient for an AI-assisted workflow where Claude is the primary committer and follows the rules. Revisit hook enforcement when human contributors join.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Docker not available in some dev envs | `npm run test:integration` documents the Docker prerequisite; unit tests always work without it |
| MSW handler drift (handlers don't match real API) | Integration tests and E2E tests will catch divergence; handlers are typed against the same TS types as the real service |
| E2E flakiness from timing | Use Playwright `waitForURL`, `waitForSelector` — never fixed `sleep`; add `retries: 1` in playwright config for CI |
| Test DB state bleed between tests | Each backend integration test wraps in a transaction and rolls back, OR uses `beforeEach` truncate; E2E uses isolated test user per suite |
