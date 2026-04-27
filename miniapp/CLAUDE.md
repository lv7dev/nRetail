# nRetail MiniApp

## Overview

Zalo Mini App built with React 18 + TypeScript, targeting the Zalo platform (Vietnamese super app). Uses Vite as build tool, Zustand for client state, TanStack Query for server state, React Router for navigation, Axios for HTTP, and Tailwind CSS + standard CSS for styling.

> **Note:** `zmp-sdk`, `zmp-ui`, and `zmp-vite-plugin` are **required Zalo platform dependencies** — they must stay installed for the Mini App to build and run. Do NOT remove them. Only import `zmp-sdk` and `zmp-ui` in application code when explicitly required (use lazy imports for `zmp-sdk`). Exception: `zaloBootstrap.ts` uses a top-level import of `getSystemInfo` — see the Zalo SDK section.

## Project Structure

```
├── src/
│   ├── app.tsx                     # Bootstrap: imports styles, wraps providers, mounts React app
│   ├── zaloBootstrap.ts            # Seeds localStorage from Zalo system info before i18n/theme init — MUST be imported first in app.tsx
│   ├── i18n.ts                     # i18next setup (namespaces: common, auth, errors, outlets, home, outlet-detail, account)
│   ├── global.d.ts                 # Global Window augmentations (APP_CONFIG, APP_ID)
│   ├── components/
│   │   ├── AppLayout.tsx           # Protected app shell (header row with ThemeSwitcher+LanguageSwitcher, bottom nav, page outlet)
│   │   ├── AuthLayout.tsx          # Auth page shell (centered, floating back button + ThemeSwitcher+LanguageSwitcher)
│   │   ├── AuthProvider.tsx        # Rehydration: calls GET /auth/me on mount if token exists
│   │   ├── ThemeProvider.tsx       # Effect provider: syncs html.dark class + body[zaui-theme] from useThemeStore
│   │   ├── ui/                     # Reusable, generic UI components (Button, Card, etc.)
│   │   │   └── index.ts            # Barrel export
│   │   └── shared/                 # App-specific shared components (BottomNav, ProtectedRoute, OutletGuard)
│   │       ├── OutletGuard.tsx     # Route guard: redirects to /outlets if no outlet selected
│   │       └── ThemeSwitcher/      # Dropdown component: Light / System / Dark options, highlights active preference
│   ├── pages/                      # Route-level components (one file or folder per route)
│   │   ├── splash/                 # Splash screen shown during auth rehydration
│   │   ├── outlets/                # Outlet picker (shown after login, before app features)
│   │   ├── home/
│   │   ├── profile.tsx             # Profile page — logout button (data-testid="logout-btn")
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/           # Step 1: phone number
│   │       ├── register/complete/  # Step 3: name + password (needs otpToken in router state)
│   │       ├── otp/                # Step 2: OTP verification (shared by register + forgot-password)
│   │       ├── forgot-password/    # Step 1: phone number (forgot-password flow)
│   │       └── new-password/       # Step 3: new password (needs otpToken in router state)
│   ├── store/                      # Zustand stores — one file per domain
│   │   ├── useAuthStore.ts         # Auth session: user, isReady, setAuth, clearAuth (also clears outlet)
│   │   ├── useCartStore.ts
│   │   ├── useOutletStore.ts       # Selected outlet, persisted to localStorage (key: outlet-storage)
│   │   └── useThemeStore.ts        # Theme preference (light/dark/system) with localStorage persistence
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # TanStack Query mutations/queries for all auth operations
│   │   ├── useDebounce.ts          # Generic debounce hook: useDebounce<T>(value, delay) → T
│   │   └── useOutlets.ts           # Outlets domain hook: infinite queries + membership mutations
│   ├── services/                   # API / external service calls
│   │   ├── axios.ts                # Axios instance, interceptors, typed helpers (get/post/put/del)
│   │   ├── authService.ts          # Auth API calls (typed functions over axios helpers)
│   │   └── outletService.ts        # Outlet API calls: getOutlets({ connected, q, cursor }) → GET /outlets
│   ├── types/                      # Shared TypeScript interfaces & types
│   │   ├── auth.ts                 # User, TokenPair, AuthResponse, OtpVerifyResponse
│   │   ├── cart.ts                 # CartItem
│   │   └── outlet.ts               # Outlet (id, name, address, role: OWNER|MANAGER|STAFF)
│   ├── mocks/                      # Test infrastructure — MSW server + handlers (never imported in prod)
│   │   ├── server.ts               # MSW Node server (used by integration tests)
│   │   ├── handlers/
│   │   │   ├── auth.ts             # MSW handlers for all auth endpoints
│   │   │   └── outlets.ts          # MSW handlers for outlet endpoints
│   │   └── components/
│   │       └── PasswordInput.mock.tsx  # Minimal PasswordInput mock (avoids SVG import in jsdom)
│   ├── utils/                      # Pure helper functions
│   │   ├── storage.ts              # nativeStorage wrapper for token keys
│   │   ├── apiError.ts             # ApiError class + resolveApiError() for i18n-aware messages
│   │   └── cn.ts                   # Tailwind class merging utility
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── errors.json         # Error code → English message map
│   │   └── vi/
│   │       ├── common.json
│   │       ├── auth.json
│   │       └── errors.json         # Error code → Vietnamese message map
│   ├── css/
│   │   ├── app.css                 # App-specific styles (safe area vars, etc.)
│   │   └── tailwind.css            # Tailwind directives
│   └── static/
│       └── bg.svg                  # Background asset
├── e2e/                            # Playwright E2E tests (real backend)
│   ├── tsconfig.json               # E2E-specific TS config: extends root, adds node + @playwright/test types
│   ├── fixtures/
│   │   └── auth.ts                 # seedUser, loginAs, setExpiredAccessToken, fillOtpBoxes, API_BASE
│   ├── global-setup.ts             # Cleans up test users/OTPs before each run (connects to test DB directly)
│   └── auth/
│       ├── register.spec.ts
│       ├── register-complete.spec.ts
│       ├── login.spec.ts
│       ├── logout.spec.ts
│       ├── forgot-password.spec.ts
│       ├── otp-errors.spec.ts
│       ├── route-guard.spec.ts
│       └── token-refresh.spec.ts
├── index.html                      # HTML entry point (<div id="app">)
├── package.json
├── tsconfig.json                   # Strict mode, path alias @/* → ./src/*, types: vite/client + vitest/globals, include: src only
├── vite.config.mts                 # Root: ./src, plugins: react (ZMP workflow — do NOT use for npx vite directly)
├── vite.e2e.config.mts             # Root: ., plugins: react (E2E only — used by Playwright webServer)
├── vitest.integration.config.ts    # Separate Vitest config for *.integration.test.* files
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # Tailwind + Autoprefixer
├── playwright.config.ts            # Playwright config (dual webServer: Vite:3000 + NestJS:3001, workers:1)
├── app-config.json                 # Zalo Mini App settings (title, theme, safe areas)
├── zmp-cli.json                    # ZMP CLI project metadata
└── .env                            # APP_ID, ZMP_TOKEN, VITE_API_BASE_URL (do not commit secrets)
```

## App Flow

```
index.html → src/app.tsx
  → import zaloBootstrap  (seeds localStorage['i18nextLng'] + localStorage['theme-preference'] from Zalo system info if absent)
  → import i18n           (LanguageDetector reads localStorage — must run AFTER zaloBootstrap)
  → QueryClientProvider → ThemeProvider → BrowserRouter → AuthProvider
      → ThemeProvider syncs html.dark class + body[zaui-theme] from useThemeStore (pure effect, no markup)
      → AuthProvider calls GET /auth/me on mount (if token in storage)
      → Shows SplashPage until isReady = true
      → Routes render after rehydration completes:
          ProtectedRoute (checks user)
            → /outlets         → OutletListPage (pick outlet before entering app)
            → OutletGuard (checks selectedOutlet from useOutletStore)
                → AppLayout (header shows outlet name, tappable → /outlets to re-select)
                    → app pages (/, /products, /cart, /orders, /profile)
```

## Architecture Principles

### Components

- `components/ui/` — generic, reusable, no business logic (Button, Card, Modal)
- `components/shared/` — app-specific shared components (Header, BottomNav, ProtectedRoute)
- `pages/` — route-level components; may be a single file or a folder for complex routes

### API Client (Axios)

All HTTP calls go through `services/axios.ts`. It exports typed helpers `get<T>`, `post<T>`, `put<T>`, `del<T>` that automatically unwrap the backend `{ data: T }` envelope. A request interceptor attaches the Bearer token and a response interceptor handles silent 401 token refresh. **Never use `fetch` or create a second Axios instance** for app requests.

See `src/services/CLAUDE.md` for the full API surface, interceptor behaviour, silent refresh details, error normalisation, and testing patterns.

### Error Handling

Errors thrown by the response interceptor are typed as `ApiError { status, message, code? }`. Use `resolveApiError(err, t)` from `@/utils/apiError` in mutation `onError` handlers — it returns an i18n-translated user-facing string by looking up `err.code` in `locales/{vi,en}/errors.json`.

See `src/utils/CLAUDE.md` for `ApiError` and `resolveApiError` API. See `src/services/CLAUDE.md` for how errors are produced by the interceptor.

### Token Storage (nativeStorage)

Tokens are stored via `storage` from `utils/storage.ts` — uses `nativeStorage` from `zmp-sdk` inside the Zalo container, falls back to `localStorage` in browser dev and tests. Platform is detected once at module load via `window.APP_ID`.

Always use `storage.getAccessToken()`, `.getRefreshToken()`, `.setTokens()`, `.clearTokens()` — never read/write token keys directly. See `src/utils/CLAUDE.md`.

### State (Zustand)

One store file per domain in `src/store/`. Stores hold **client/UI state only** — not server data (use TanStack Query for that). See `src/store/CLAUDE.md` for the full store catalogue, shapes, and testing patterns.

### Theme System

Dark/light/system theme is managed by three cooperating pieces:

| Piece | File | Role |
|---|---|---|
| `useThemeStore` | `store/useThemeStore.ts` | Holds `preference` (`'light' \| 'dark' \| 'system'`), persisted to `localStorage` under key `theme-preference`. Default: `'system'`. |
| `ThemeProvider` | `components/ThemeProvider.tsx` | Reads `preference`, resolves to `'light'` or `'dark'` (system follows `prefers-color-scheme`), then syncs two DOM attributes: `html.dark` class (Tailwind `dark:`) and `body[zaui-theme]` (zmp-ui dark styling). Listens for OS `change` events when preference is `'system'`. Renders children directly — no markup. |
| `ThemeSwitcher` | `components/shared/ThemeSwitcher/` | Dropdown component with three options: Light / System / Dark. Calls `useThemeStore.setTheme`. Placed in `AuthLayout`, `AppLayout` header row, and the Profile page. |

**Dark mode in components:** use `dark:` Tailwind variant alongside semantic token classes — never `[zaui-theme="dark"]` selectors. See `src/components/CLAUDE.md` for the token mapping and styling rules. Store API and test helpers are in `src/store/CLAUDE.md`.

### Zalo WebView Routing

`BrowserRouter` in `app.tsx` **must** set `basename` to the Zalo app path:

```tsx
const basename = window.APP_ID ? `/zapps/${window.APP_ID}` : '/';
<BrowserRouter basename={basename}>
```

**Why:** When Zalo opens the mini app, the browser URL is `/zapps/{APP_ID}/`. Without `basename`, React Router sees an unknown path, hits the `path="*"` wildcard, and redirects to `/login` on every cold open.

**Rule:** Never hardcode `/login` or any other absolute path in imperative navigations (`window.location.replace`). Always compute the base:

```ts
const base = window.APP_ID ? `/zapps/${window.APP_ID}` : '';
window.location.replace(`${base}/login`);
```

`window.APP_ID` is the same guard used by `zaloBootstrap.ts` and `storage.ts` — consistent across the app.

---

### Navigation History and Swipe-Back

React Router navigation in Zalo's WebView respects the browser history stack. The swipe-back gesture pops the stack exactly like a browser Back button.

| Method | History effect | Swipe-back result |
|---|---|---|
| `navigate('/path')` | **Pushes** new entry | Can swipe back to previous route |
| `navigate('/path', { replace: true })` | **Replaces** current entry | Previous route is gone — swipe back skips it |

**Design decisions already made:**

- `OutletListPage` → `navigate('/', { replace: true })` after outlet selection — intentional. Users should not land back on the outlet picker by swiping. They can re-select via the `AppLayout` header.
- `BottomNav` → `navigate(tab.path)` (push) — each tab tap is a new history entry. Users can swipe back through their tab navigation history.

---

### Zalo Bootstrap

`src/zaloBootstrap.ts` seeds `localStorage` from Zalo's system info before any module that reads it initializes. It runs as a side-effect on module import.

**What it seeds:**
- `localStorage['i18nextLng']` — from `getSystemInfo().zaloLanguage`, normalized to base tag (`'vi-VN'` → `'vi'`), only if the key is absent and the language is supported (`'vi'` or `'en'`)
- `localStorage['theme-preference']` — from `getSystemInfo().zaloTheme`, written as Zustand persist JSON (`{"state":{"preference":"dark"},"version":0}`), only if the key is absent. Unknown theme values map to `'system'`.

**Rules:**
- Only runs inside the Zalo container (`window.APP_ID` guard) — no-op in browser dev and tests
- Seed-only: never overwrites an existing user preference
- **Import order is critical** — `import '@/zaloBootstrap'` MUST come before `import '@/i18n'` in `app.tsx`. The i18next `LanguageDetector` reads `localStorage['i18nextLng']` during `i18n.init()`, so the seed must exist first.

### App Rehydration

`AuthProvider` wraps the router and handles token rehydration:

1. On mount, checks `storage.getAccessToken()`
2. If token exists → calls `authService.getMe()` → sets `setAuth(user)`
3. If no token or `getMe` fails → calls `useAuthStore.setState({ isReady: true })` (no user)
4. Until `isReady`, renders `<SplashPage />` instead of children

`ProtectedRoute` respects `isReady`:

- `!isReady` → render `null` (splash is shown by `AuthProvider`)
- `isReady && !user` → redirect to `/login`
- `isReady && user` → render the outlet

### Server State (TanStack Query)

Use `@tanstack/react-query` for all async data fetching. Custom hooks in `src/hooks/` wrap all queries and mutations — pages and components never call services directly. Mutations return `isPending` — use it for button loading state instead of `useState`. See `src/hooks/CLAUDE.md` for the full hook catalogue and testing patterns.

### Forms (react-hook-form + zod)

All forms use `react-hook-form` + `zodResolver`. Schema factories are co-located with the page as `schema.ts`, exported as `(t: TFunction) => z.object(...)`. **Never wrap fields in `z.preprocess`** — it changes the inferred input type to `unknown`, breaking the zodResolver type contract. See `src/pages/CLAUDE.md` for form conventions, the PasswordInput mock, and testing patterns for forms.

### Button Loading State

The `Button` component accepts `loading?: boolean`. When `true`, it shows an SVG spinner and applies `pointer-events-none`. Always wire `isPending` from a TanStack Query mutation to the submit button — never manage submit loading state with `useState`. See `src/components/CLAUDE.md`.

### Zalo SDK

Always wrap `zmp-sdk` calls in a custom hook using lazy `import()` — never import at module level.

**Exception:** `zaloBootstrap.ts` uses a top-level ES import of `getSystemInfo` from `zmp-sdk`. This is safe because the function is only *called* inside the `window.APP_ID` guard (never in browser dev or tests), and the module must execute synchronously at import time before i18n initializes. All other `zmp-sdk` usage must still use lazy imports.

```ts
// hooks/useZaloUser.ts
import { useEffect, useState } from 'react';

export function useZaloUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    import('zmp-sdk').then(({ getUserInfo }) => getUserInfo().then(setUser));
  }, []);
  return user;
}
```

## Commands

```bash
npm run start              # Dev server via zmp start (localhost:3000)
npm run login              # Authenticate with Zalo (zmp login)
npm run deploy             # Build & deploy to Zalo (zmp deploy)
npm run test               # Unit/component tests (Vitest, excludes *.integration.test.*)
npm run test:coverage      # Unit tests + coverage report (100% threshold enforced)
npm run test:integration   # Integration tests (Vitest + MSW, includes *.integration.test.*)
npm run format             # Prettier format: src/**/*.{ts,tsx} + e2e/**/*.ts
npx playwright test        # E2E tests (requires backend + Redis running)
npx playwright test --ui   # E2E tests with interactive UI
```

## CI

The miniapp CI workflow (`.github/workflows/miniapp.yml`) runs three jobs on every PR/push to `main`:

| Job | Check name | What it runs |
|---|---|---|
| build | `ci / build` | `npx tsc --noEmit` — type check without emitting files |
| lint | `ci / lint` | `npx prettier --check "src/**/*.{ts,tsx}"` |
| test | `ci / test` | `npm run test` — Vitest unit tests |

**Path filtering:** All three jobs use `dorny/paths-filter` to detect whether `miniapp/**` files changed. If nothing changed, the job skips the real work but still reports ✅ — this is required because the jobs are listed as required status checks in the GitHub Ruleset and must always report a result.

**Node version:** CI uses **Node 24** to match the local dev environment. The `package-lock.json` is generated by npm on Node 24 — using a different Node version in CI causes `npm ci` to fail with lock file sync errors. If you upgrade Node locally, update the workflow too.

**`zmp build` is not available in CI** — it requires interactive Zalo authentication. Type checking via `tsc --noEmit` is the substitute for a build check.

## Key Dependencies

| Package                                                     | Purpose                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| react / react-dom                                           | UI framework                                                             |
| react-router-dom                                            | Client-side routing                                                      |
| zustand                                                     | Client state management                                                  |
| @tanstack/react-query                                       | Server state, async data fetching & caching                              |
| axios                                                       | HTTP client (with interceptors for auth + error normalization)           |
| react-hook-form + @hookform/resolvers                       | Form state management                                                    |
| zod                                                         | Schema validation (forms)                                                |
| react-i18next + i18next                                     | Internationalization (VI + EN, namespaces: common, auth, errors, outlets, home, outlet-detail, account) |
| zmp-sdk                                                     | Zalo Mini App SDK — required platform dep, lazy import only              |
| zmp-ui                                                      | Zalo UI components — required platform dep, import when needed           |
| zmp-vite-plugin                                             | Zalo Vite plugin — required for Mini App to build and run, do NOT remove |
| vite + @vitejs/plugin-react                                 | Build tooling                                                            |
| tailwindcss                                                 | Styling                                                                  |
| vitest + @testing-library/react + @testing-library/jest-dom | Unit & component testing                                                 |
| playwright + @playwright/test                               | End-to-end testing                                                       |

## Conventions

- **Path aliases**: `@/*` resolves to `./src/*`
- **Styling**: Tailwind utility classes preferred; standard CSS (`.css` files) for complex styles — no SCSS/Sass
- **Components**: Default exports, TypeScript, functional components with hooks
- **Routing**: React Router (`BrowserRouter` / `Routes` / `Route`); add routes in `src/app.tsx`
- **State**: Zustand stores in `src/store/` — one store per domain; use for client/UI state only
- **Server state**: `@tanstack/react-query` for all async data fetching, caching, and synchronization
- **Forms**: `react-hook-form` + `zod` resolver for all forms; define schemas in `src/types/` or co-located with the form
- **Services**: All API calls in `src/services/` — never fetch directly in components
- **Types**: Shared interfaces in `src/types/`
- **Utils**: Pure helpers in `src/utils/` — no side effects
- **Unit/component tests**: Vitest + React Testing Library; test files co-located as `*.test.tsx`
- **E2E tests**: Playwright; test files in `e2e/`
- **Target**: Android 5+, iOS 9.3+, Chrome 49+, Safari 9.1+

## Adding a New Page

1. Create `src/pages/my-page/index.tsx` (use a folder — most pages have forms or subs)
2. Add route in `src/app.tsx`:
   ```tsx
   <Route path="/my-page" element={<MyPage />} />
   ```

## Adding a New Service

1. Create `src/services/myService.ts`
2. Import `get`, `post`, `put`, `del` from `./axios` — never use raw Axios or fetch
3. Export typed async functions
4. Wrap in a hook in `src/hooks/` using `useMutation` or `useQuery`

## Testing

### TDD Rule — Always Test First

Pure TDD is enforced across all three tiers:

1. **Write the test** and commit it (RED — test fails because feature doesn't exist yet)
2. **Write the implementation** and commit it (GREEN — test passes)
3. **Refactor** if needed (tests stay green)

Never write implementation code before a failing test exists for it.

### Three-Tier Test Structure

| Tier                 | Files                                    | Runner                     | What it tests                                               |
| -------------------- | ---------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| **Unit / Component** | `*.test.{ts,tsx}` co-located             | `npm run test`             | Component rendering, hook logic, utils, stores — no network |
| **Integration**      | `*.integration.test.{ts,tsx}` co-located | `npm run test:integration` | Real axios + TanStack Query + MSW HTTP interception         |
| **E2E**              | `e2e/**/*.spec.ts`                       | `npx playwright test`      | Full user flows against real backend                        |

### Coverage (100% enforced)

`npm run test:coverage` runs unit tests with `@vitest/coverage-v8` and enforces **100% coverage** on all four metrics: statements, branches, functions, lines.

**Excluded from coverage** (configured in `vite.config.mts`):

- `src/app.tsx`, `src/i18n.ts` — bootstrap/config, not logic
- `src/setupTests*.ts`, `src/mocks/**` — test infrastructure
- `src/types/**`, `src/**/index.ts` — type definitions and barrel exports
- `src/services/authService.ts` — thin API wrapper, fully covered by integration tests
- `src/services/axios.ts` — interceptor paths covered by `axios.integration.test.ts`

**v8 ignore markers** — use `/* v8 ignore next */` (single line) or `/* v8 ignore start */` / `/* v8 ignore stop */` (block) for architecturally unreachable branches only (defensive null checks, platform detection, dynamic imports). Never ignore real logic.

### Detailed Patterns (per-directory CLAUDE.md files)

| Topic | Where to find it |
|---|---|
| QueryClientProvider wrapper, service mocking, i18n mocking, PasswordInput mock | `src/pages/CLAUDE.md` |
| `vi.hoisted()` pattern, testing hooks directly | `src/hooks/CLAUDE.md` |
| MSW server setup, handler shapes, per-test overrides | `src/mocks/CLAUDE.md` |
| Playwright fixtures, OTP bypass, phone number conventions | `e2e/CLAUDE.md` |

## Zalo Safe Area

The app runs inside a Zalo iframe with `statusBar: "transparent"` and `actionBarHidden: true` (`app-config.json`). The OS status bar and Zalo's own chrome strip overlap the top of the viewport. Use these CSS custom properties (defined by `zmp-ui` and `src/css/app.css`) to offset UI elements correctly:

| Variable                        | Value                                       | Covers                                |
| ------------------------------- | ------------------------------------------- | ------------------------------------- |
| `--zaui-safe-area-inset-top`    | `env(safe-area-inset-top, 0px)`             | OS status bar height                  |
| `--zaui-safe-area-inset-bottom` | `env(safe-area-inset-bottom, 0px)`          | Home indicator / Android nav          |
| `--zalo-chrome-top`             | `calc(--zaui-safe-area-inset-top + 2.6rem)` | OS status bar **+** Zalo chrome strip |

**Rules:**

- Use `--zalo-chrome-top` for anything that must clear both the OS status bar and the Zalo chrome strip (e.g. `AuthLayout` floating controls)
- Use `--zaui-safe-area-inset-top` / `.pt-safe` for content that only needs to clear the OS status bar (e.g. `AppLayout` page content)
- Use `--zaui-safe-area-inset-bottom` / `.pb-safe` for content that must clear the bottom home indicator (e.g. `BottomNav`)
- All variables default to `0px` outside the Zalo platform — no special handling needed for browser dev or tests

**Important:** `--zaui-safe-area-inset-top` covers the OS status bar only. Even with `actionBarHidden: true`, Zalo renders a thin mini-app controls strip (~2.6rem above content) that is NOT captured by `env(safe-area-inset-top)`. Use `--zalo-chrome-top` whenever you need to clear this strip.

## Zalo Platform Dependencies

These three packages are **required infrastructure** for Zalo Mini App — never remove them:

| Package           | Why Required                                                |
| ----------------- | ----------------------------------------------------------- |
| `zmp-sdk`         | Provides Zalo APIs (auth, payment, sharing, etc.)           |
| `zmp-ui`          | Zalo-native UI components (matches platform look & feel)    |
| `zmp-vite-plugin` | Vite plugin that enables `zmp start` / `zmp deploy` to work |

**Usage rules:**

- `zmp-vite-plugin` — configured in `vite.config.mts`, never imported in app code
- `zmp-sdk` — always use lazy `import()` in a custom hook, never at module top level (exception: `zaloBootstrap.ts`)
- `zmp-ui` — import components directly when needed for Zalo-native UI
