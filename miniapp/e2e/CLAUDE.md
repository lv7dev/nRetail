# E2E Tests

Playwright tests running against real frontend + real backend. All tests in `e2e/auth/` cover auth flows end-to-end.

## Prerequisites

```bash
# In backend/ — starts PostgreSQL (port 5434) + Redis
docker compose up -d

# Backend serves on port 3001 (Playwright webServer config sets PORT=3001)
# Frontend serves on port 3000 (Vite)
# Both are auto-started by Playwright via playwright.config.ts webServer
```

Redis must be running before `npx playwright test` — the backend webServer command will fail to start without it.

## Folder Structure

```
e2e/
├── fixtures/
│   └── auth.ts          # Shared helpers: seedUser, loginAs, setExpiredAccessToken, fillOtpBoxes, API_BASE
├── global-setup.ts      # Runs once before all tests: seeds PhoneConfig for OTP bypass
├── auth/
│   ├── register.spec.ts       # Flows 7.1, 7.2: register + duplicate phone error
│   ├── login.spec.ts          # Flows 7.3, 7.4: login + invalid credentials
│   ├── forgot-password.spec.ts # Flow 7.5: full reset flow + login with new password
│   ├── route-guard.spec.ts    # Flow 7.6: unauthenticated visit to / → /login
│   └── token-refresh.spec.ts  # Flows 8.1, 8.2: silent refresh + forced logout
```

## Fixtures (`fixtures/auth.ts`)

### `seedUser(request, phone, password, name)`

Registers a user via the real API (3-step: OTP request → OTP verify → register). Uses the test OTP bypass (`999999`). Throws if registration fails.

```ts
import { seedUser } from '../fixtures/auth'

test.beforeAll(async ({ request }) => {
  await seedUser(request, '0901234567', 'password123', 'Test User')
})
```

### `loginAs(page, phone, password)`

Navigates to `/login`, fills credentials, submits, waits for redirect to `/`. Use in tests that need an authenticated session.

```ts
import { loginAs } from '../fixtures/auth'

test('...', async ({ page }) => {
  await loginAs(page, '0901234567', 'password123')
  // page is now on / with tokens in localStorage
})
```

### `setExpiredAccessToken(page, validRefreshToken)`

Injects an expired access token while keeping a valid refresh token. Used to test silent token refresh (flow 10).

```ts
const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'))
await setExpiredAccessToken(page, refreshToken!)
// next navigation will trigger the 401 → refresh → retry flow
```

### `fillOtpBoxes(page, otp)`

Fills a 6-digit OTP input rendered as individual boxes. Uses `page.locator('input').nth(i)`.

```ts
await fillOtpBoxes(page, '999999')
```

### `API_BASE`

The base URL for direct API calls in `beforeAll` hooks: `process.env.API_BASE ?? 'http://localhost:3001'`.

## Global Setup (`global-setup.ts`)

Runs once before all tests. Connects to the test database directly via `pg` to:
1. Clean up `RefreshToken` and `User` rows for test phone numbers
2. Upsert a `PhoneConfig` row for each test phone with `defaultOtp: '999999'`

This enables the OTP bypass used by `seedUser` and the register/forgot-password flows.

> **Why direct DB access?** There is no admin API endpoint for seeding test data. The test DB URL is `postgresql://postgres:postgres@localhost:5433/test_nretail`.

## Phone Number Conventions

Each spec file uses a dedicated phone number to prevent cross-test contamination:

| Spec | Phone |
|------|-------|
| `register.spec.ts` | `0900000001` |
| `login.spec.ts` | `0900000002` |
| `forgot-password.spec.ts` | `0900000003` |
| `route-guard.spec.ts` | (no seeding needed) |
| `token-refresh.spec.ts` | `0900000002` (shared with login, seeded in beforeAll) |

## OTP Bypass

All E2E tests use OTP code `999999`. This works because `global-setup.ts` upserts a `PhoneConfig` row for each test phone number. The backend checks `PhoneConfig.defaultOtp` before validating the real OTP.

## Adding a New E2E Test

1. Create `e2e/auth/<flow>.spec.ts`
2. Add a unique phone number constant (avoid collisions with existing specs)
3. Add the phone to `global-setup.ts` so it gets a `PhoneConfig` row and cleanup
4. Use fixtures from `e2e/fixtures/auth.ts` — `seedUser` in `beforeAll`, `loginAs` when you need auth
5. Follow TDD: write the test first (it will fail until the feature is built)
