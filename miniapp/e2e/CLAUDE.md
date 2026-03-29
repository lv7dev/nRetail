# E2E Tests

Playwright tests running against real frontend + real backend. All tests in `e2e/auth/` cover auth flows end-to-end.

## Prerequisites

```bash
# In backend/ — starts PostgreSQL (port 5433 for tests) + Redis
docker compose up -d

# Backend serves on port 3001 (Playwright webServer config sets PORT=3001)
# Frontend serves on port 3000 (Vite, using vite.e2e.config.mts)
# Both are auto-started by Playwright via playwright.config.ts webServer
```

Redis must be running before `npx playwright test` — the backend webServer command will fail to start without it.

> **Run from `miniapp/`:** Always run `npx playwright test` from the `miniapp/` directory, not the repo root.

## Playwright Config Notes

- **`workers: 1`** — tests run sequentially to prevent parallel OTP rate limit hits (6 req/5 min per IP)
- **`vite.e2e.config.mts`** — separate Vite config used for E2E; sets `root: "."` so Vite finds `index.html` at the project root (the main `vite.config.mts` uses `root: "./src"` for the ZMP workflow and can't serve SPA routes correctly under `npx vite`)
- **OTP throttle env vars** — backend is started with `OTP_THROTTLE_LIMIT=1000 OTP_THROTTLE_TTL=1000` so OTP endpoints are effectively unlimited during E2E runs
- **`reuseExistingServer: !process.env.CI`** — in dev mode, Playwright reuses servers already running on ports 3000/3001; kill them first if they were started with a different config (`kill $(lsof -ti:3000,3001)`)

## Folder Structure

```
e2e/
├── tsconfig.json        # E2E TypeScript config: extends root, adds node + @playwright/test types
├── fixtures/
│   └── auth.ts          # Shared helpers: seedUser, loginAs, setExpiredAccessToken, fillOtpBoxes, API_BASE
├── global-setup.ts      # Runs once before all tests: seeds PhoneConfig for OTP bypass
├── auth/
│   ├── register.spec.ts          # Register flow + duplicate phone error
│   ├── register-complete.spec.ts # RegisterComplete: valid submit, missing state redirect, password mismatch
│   ├── login.spec.ts             # Login + invalid credentials
│   ├── logout.spec.ts            # Logout → /login redirect, post-logout protected route guard
│   ├── forgot-password.spec.ts   # Full reset flow + login with new password
│   ├── otp-errors.spec.ts        # Wrong OTP error, expired OTP error (via page.route mock)
│   ├── route-guard.spec.ts       # Unauthenticated visit to / → /login
│   └── token-refresh.spec.ts     # Silent refresh + forced logout
```

## Fixtures (`fixtures/auth.ts`)

### `seedUser(request, phone, password, name)`

Registers a user via the real API (3-step: OTP request → OTP verify → register). Uses the test OTP bypass (`999999`). Throws if registration fails.

```ts
import { seedUser } from '../fixtures/auth';

test.beforeAll(async ({ request }) => {
  await seedUser(request, '0901234567', 'password123', 'Test User');
});
```

### `loginAs(page, phone, password)`

Navigates to `/login`, fills credentials, submits, waits for redirect to `/`. Use in tests that need an authenticated session.

```ts
import { loginAs } from '../fixtures/auth';

test('...', async ({ page }) => {
  await loginAs(page, '0901234567', 'password123');
  // page is now on / with tokens in localStorage
});
```

### `setExpiredAccessToken(page, validRefreshToken)`

Injects an expired access token while keeping a valid refresh token. Used to test silent token refresh (flow 10).

```ts
const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
await setExpiredAccessToken(page, refreshToken!);
// next navigation will trigger the 401 → refresh → retry flow
```

### `fillOtpBoxes(page, otp)`

Fills a 6-digit OTP input rendered as individual boxes. Uses `page.locator('input').nth(i)`.

```ts
await fillOtpBoxes(page, '999999');
```

### `API_BASE`

The base URL for direct API calls in `beforeAll` hooks: `process.env.API_BASE ?? 'http://localhost:3001'`.

## Global Setup (`global-setup.ts`)

Runs once before all tests. Connects to the test database directly via `pg` to:

1. Clean up `RefreshToken`, `User`, and `OtpVerification` rows for all known test phones

This ensures each run starts from a fresh state. **No PhoneConfig seeding is needed** — the backend uses `'999999'` as a global OTP fallback for any phone without a `PhoneConfig` row.

> **Why direct DB access?** There is no admin API endpoint for cleanup. The test DB URL is `postgresql://postgres:postgres@localhost:5433/test_nretail`.

## Phone Number Conventions

Each spec file uses a dedicated phone number to prevent cross-test contamination:

| Spec                        | Phone                                                   |
| --------------------------- | ------------------------------------------------------- |
| `register.spec.ts`          | `0901111111`                                            |
| `login.spec.ts`             | `0902222222`                                            |
| `forgot-password.spec.ts`   | `0903333333`                                            |
| `route-guard.spec.ts`       | (no seeding needed)                                     |
| `token-refresh.spec.ts`     | `0902222222` (shared with login, seeded in `beforeAll`) |
| `register-complete.spec.ts` | `0904444444`                                            |
| `logout.spec.ts`            | `0905555555`                                            |
| `otp-errors.spec.ts`        | `0906666666`                                            |

## OTP Bypass

All E2E tests use OTP code `999999`. This works because `global-setup.ts` upserts a `PhoneConfig` row for each test phone number. The backend checks `PhoneConfig.defaultOtp` before validating the real OTP.

## TypeScript Config

E2E files run in Node (not browser) and use Playwright and `pg` APIs. A dedicated `e2e/tsconfig.json` extends the root `tsconfig.json` and adds:

- `types: ["node", "@playwright/test"]` — Node globals and Playwright test APIs
- `include: ["./**/*.ts"]` — covers all E2E files

The root `tsconfig.json` includes only `src/` — Node types do **not** leak into browser code.

`global-setup.ts` uses `import { Client } from 'pg'` (ESM import, not `require`).

## Adding a New E2E Test

1. Create `e2e/auth/<flow>.spec.ts`
2. Add a unique phone number constant (avoid collisions with existing specs)
3. Add the phone to `global-setup.ts` so it gets a `PhoneConfig` row and cleanup
4. Use fixtures from `e2e/fixtures/auth.ts` — `seedUser` in `beforeAll`, `loginAs` when you need auth
5. Follow TDD: write the test first (it will fail until the feature is built)
