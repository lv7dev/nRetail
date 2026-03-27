## Why

The project has unit tests but no integration tests or E2E tests, and tests are written alongside implementation rather than before it — violating pure TDD. This means regressions at the HTTP boundary, interceptor behaviour, and full user flows go undetected until manual testing. Establishing the full three-tier test pyramid now, before the app grows further, sets the discipline for all future feature work.

## What Changes

- Install MSW in miniapp for HTTP-layer integration tests
- Add `*.integration.test.tsx` pattern and separate Vitest config/script for integration tier
- Write integration tests for all 5 auth pages and the axios interceptor using MSW handlers
- Add `test/` folder in backend with a separate `jest-integration.config.ts`
- Add Docker Postgres global setup/teardown for backend integration tests
- Write backend integration tests for all auth endpoints using supertest + real DB
- Write Playwright E2E tests for auth flows 1–4 (register, login, forgot-password, route guard) and token flows 10–11 (auto-refresh, forced logout) with shared fixtures
- Update `miniapp/CLAUDE.md`, `backend/CLAUDE.md`, and root `CLAUDE.md` to document the pure TDD rule and three-tier structure

## Capabilities

### New Capabilities

- `frontend-integration-testing`: MSW-based integration tests for React pages and the axios client — intercepts at the HTTP layer so the real axios interceptor runs
- `backend-integration-testing`: supertest + real Docker Postgres integration tests for NestJS controllers — verifies full request/response cycle including DB
- `e2e-auth-flows`: Playwright E2E tests covering all auth user flows and session/token lifecycle flows against a real backend
- `pure-tdd-discipline`: Documented and enforced convention: test commit (RED) before implementation commit (GREEN) across all layers

### Modified Capabilities

- `axios-client`: Response interceptor behaviour is now covered by integration tests (not just unit tests), no requirement changes

## Impact

- `miniapp/`: new `msw` devDependency, new `test:integration` npm script, new `*.integration.test.tsx` files co-located with source
- `backend/`: new `test/` folder, new `jest-integration.config.ts`, new `test:integration` npm script, requires Docker for integration test runs
- `miniapp/e2e/`: new test files in `auth/` subfolder, new `fixtures/` helpers
- `CLAUDE.md`, `miniapp/CLAUDE.md`, `backend/CLAUDE.md`: updated with TDD rules and test tier documentation
- CI: will need Docker available for backend integration tests
