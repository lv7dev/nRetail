## 1. Frontend — MSW Integration Test Infrastructure

- [ ] 1.1 Install `msw` as devDependency in miniapp (`npm install msw --save-dev`)
- [ ] 1.2 Create `src/mocks/handlers/auth.ts` with MSW handlers for all auth endpoints (`/auth/login`, `/auth/register`, `/auth/otp/register`, `/auth/otp/forgot-password`, `/auth/otp/verify`, `/auth/refresh`, `/auth/logout`, `/auth/reset-password`, `/auth/me`)
- [ ] 1.3 Create `src/mocks/server.ts` that sets up the MSW Node server with the auth handlers
- [ ] 1.4 Update `src/setupTests.ts` (or create one) to start the MSW server before all integration tests and reset handlers after each test
- [ ] 1.5 Add `test:integration` npm script to `miniapp/package.json` using `vitest --run --include "**/*.integration.test.{ts,tsx}"`
- [ ] 1.6 Update existing `test` npm script to exclude `*.integration.test.tsx` files

## 2. Frontend — Axios Interceptor Integration Tests

- [ ] 2.1 Write `src/services/axios.integration.test.ts` — test: Bearer token injected on authenticated request (RED)
- [ ] 2.2 Write test: silent refresh on 401 from authenticated request (RED)
- [ ] 2.3 Write test: forced logout when no refresh token (RED)
- [ ] 2.4 Write test: forced logout when refresh endpoint returns 401 (RED)
- [ ] 2.5 Write test: concurrent 401s use a single refresh call (RED)
- [ ] 2.6 Write test: unauthenticated 401 propagates as ApiError without redirect (RED)
- [ ] 2.7 Verify all axios integration tests pass GREEN (no implementation changes needed — interceptor already handles these)

## 3. Frontend — Auth Page Integration Tests

- [ ] 3.1 Write `src/pages/auth/login/Login.integration.test.tsx` — test: valid login calls POST /auth/login and navigates to `/` (RED → GREEN)
- [ ] 3.2 Write test: API error `INVALID_CREDENTIALS` shows error message in Login page (RED → GREEN)
- [ ] 3.3 Write `src/pages/auth/register/Register.integration.test.tsx` — test: phone submit calls POST /auth/otp/register and navigates to `/otp` (RED → GREEN)
- [ ] 3.4 Write `src/pages/auth/otp/Otp.integration.test.tsx` — test: valid OTP calls POST /auth/otp/verify and navigates to next step (RED → GREEN)
- [ ] 3.5 Write `src/pages/auth/forgot-password/ForgotPassword.integration.test.tsx` — test: phone submit calls POST /auth/otp/forgot-password and navigates to `/otp` (RED → GREEN)
- [ ] 3.6 Write `src/pages/auth/new-password/NewPassword.integration.test.tsx` — test: valid password submit calls POST /auth/reset-password and navigates to `/login` (RED → GREEN)

## 4. Backend — Integration Test Infrastructure

- [ ] 4.1 Create `backend/test/` directory and `backend/test/jest-integration.config.ts` with separate Jest config (rootDir, testMatch for `*.integration.spec.ts`, globalSetup/teardown)
- [ ] 4.2 Create `backend/test/global-setup.ts` — start Docker Postgres on port 5433, create `test_nretail` DB if not exists, run `prisma migrate deploy`
- [ ] 4.3 Create `backend/test/global-teardown.ts` — truncate all tables (or stop container if started by setup)
- [ ] 4.4 Create `backend/test/helpers/app.ts` — shared helper that creates and bootstraps the NestJS test app instance connected to test DB
- [ ] 4.5 Add `test:integration` npm script to `backend/package.json` using the new jest config

## 5. Backend — Auth Integration Tests

- [ ] 5.1 Write `backend/test/auth/auth.integration.spec.ts` — test: POST /auth/otp/register with valid phone returns 201 (RED)
- [ ] 5.2 Write test: POST /auth/otp/verify with valid OTP returns otpToken (RED)
- [ ] 5.3 Write test: POST /auth/register with valid otpToken creates user and returns token pair (RED)
- [ ] 5.4 Write test: POST /auth/login with valid credentials returns token pair (RED)
- [ ] 5.5 Write test: POST /auth/login with wrong password returns 401 with INVALID_CREDENTIALS (RED)
- [ ] 5.6 Write test: POST /auth/refresh with valid token rotates token pair (RED)
- [ ] 5.7 Write test: POST /auth/refresh with invalid token returns 401 with REFRESH_TOKEN_INVALID (RED)
- [ ] 5.8 Write test: POST /auth/logout removes refresh token from DB (RED)
- [ ] 5.9 Write test: GET /auth/me with valid Bearer returns current user (RED)
- [ ] 5.10 Write test: POST /auth/reset-password with valid otpToken sets new password (RED)
- [ ] 5.11 Verify all backend integration tests pass GREEN against real test DB

## 6. E2E — Fixtures and Structure

- [ ] 6.1 Create `miniapp/e2e/fixtures/auth.ts` with `seedUser`, `loginAs`, and `setExpiredAccessToken` helpers
- [ ] 6.2 Update `miniapp/playwright.config.ts` to add `retries: 1` for CI and configure `webServer` to also start the backend

## 7. E2E — Auth Flow Tests

- [ ] 7.1 Write `miniapp/e2e/auth/register.spec.ts` — test: full registration flow lands on `/` (RED → GREEN)
- [ ] 7.2 Write test: duplicate phone on register shows error (RED → GREEN)
- [ ] 7.3 Write `miniapp/e2e/auth/login.spec.ts` — test: valid login lands on `/` (RED → GREEN)
- [ ] 7.4 Write test: invalid credentials stay on `/login` with error (RED → GREEN)
- [ ] 7.5 Write `miniapp/e2e/auth/forgot-password.spec.ts` — test: full reset flow allows login with new password (RED → GREEN)
- [ ] 7.6 Write `miniapp/e2e/auth/route-guard.spec.ts` — test: unauthenticated direct visit to `/` redirects to `/login` (RED → GREEN)

## 8. E2E — Token Lifecycle Tests

- [ ] 8.1 Write `miniapp/e2e/auth/token-refresh.spec.ts` — test: expired access token is silently refreshed (flow 10) (RED → GREEN)
- [ ] 8.2 Write test: invalid refresh token causes forced logout and redirect to `/login` (flow 11) (RED → GREEN)

## 9. Documentation Updates

- [ ] 9.1 Update `miniapp/CLAUDE.md` Testing section — add TDD rule, three-tier structure, file naming conventions, and `test:integration` script
- [ ] 9.2 Update `backend/CLAUDE.md` Testing section — add TDD rule, three-tier structure, Docker prerequisite, and `test:integration` script
- [ ] 9.3 Update root `CLAUDE.md` quality gates — add `npm run test:integration` for both apps and `npx playwright test` to the pre-session-close checklist
