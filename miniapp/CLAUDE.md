# nRetail MiniApp

## Overview

Zalo Mini App built with React 18 + TypeScript, targeting the Zalo platform (Vietnamese super app). Uses Vite as build tool, Zustand for client state, TanStack Query for server state, React Router for navigation, Axios for HTTP, and Tailwind CSS + standard CSS for styling.

> **Note:** `zmp-sdk`, `zmp-ui`, and `zmp-vite-plugin` are **required Zalo platform dependencies** — they must stay installed for the Mini App to build and run. Do NOT remove them. Only import `zmp-sdk` and `zmp-ui` in application code when explicitly required (use lazy imports for `zmp-sdk`).

## Project Structure

```
├── src/
│   ├── app.tsx                     # Bootstrap: imports styles, wraps providers, mounts React app
│   ├── i18n.ts                     # i18next setup (namespaces: common, auth, errors)
│   ├── components/
│   │   ├── AppLayout.tsx           # Protected app shell (bottom nav, page outlet)
│   │   ├── AuthLayout.tsx          # Auth page shell (centered, floating back button)
│   │   ├── AuthProvider.tsx        # Rehydration: calls GET /auth/me on mount if token exists
│   │   ├── ui/                     # Reusable, generic UI components (Button, Card, etc.)
│   │   │   └── index.ts            # Barrel export
│   │   └── shared/                 # App-specific shared components (Header, BottomNav, ProtectedRoute)
│   ├── pages/                      # Route-level components (one file or folder per route)
│   │   ├── splash/                 # Splash screen shown during auth rehydration
│   │   ├── home/
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/           # Step 1: phone number
│   │       ├── register/complete/  # Step 3: name + password (needs otpToken in router state)
│   │       ├── otp/                # Step 2: OTP verification (shared by register + forgot-password)
│   │       ├── forgot-password/    # Step 1: phone number (forgot-password flow)
│   │       └── new-password/       # Step 3: new password (needs otpToken in router state)
│   ├── store/                      # Zustand stores — one file per domain
│   │   └── useAuthStore.ts
│   ├── hooks/                      # Custom React hooks
│   │   └── useAuth.ts              # TanStack Query mutations/queries for all auth operations
│   ├── services/                   # API / external service calls
│   │   ├── axios.ts                # Axios instance, interceptors, typed helpers (get/post/put/del)
│   │   └── authService.ts          # Auth API calls (typed functions over axios helpers)
│   ├── types/                      # Shared TypeScript interfaces & types
│   │   └── auth.ts                 # User, TokenPair, AuthResponse, OtpVerifyResponse
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
├── index.html                      # HTML entry point (<div id="app">)
├── package.json
├── tsconfig.json                   # Strict mode, path alias @/* → ./src/*, types: vite/client + vitest/globals
├── vite.config.mts                 # Root: ./src, plugins: react
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # Tailwind + Autoprefixer
├── app-config.json                 # Zalo Mini App settings (title, theme, safe areas)
├── zmp-cli.json                    # ZMP CLI project metadata
└── .env                            # APP_ID, ZMP_TOKEN, VITE_API_BASE_URL (do not commit secrets)
```

## App Flow

```
index.html → src/app.tsx → QueryClientProvider → BrowserRouter → AuthProvider
  → AuthProvider calls GET /auth/me on mount (if token in storage)
  → Shows SplashPage until isReady = true
  → Routes render after rehydration completes
```

## Architecture Principles

### Components
- `components/ui/` — generic, reusable, no business logic (Button, Card, Modal)
- `components/shared/` — app-specific shared components (Header, BottomNav, ProtectedRoute)
- `pages/` — route-level components; may be a single file or a folder for complex routes

### API Client (Axios)

All HTTP calls go through `services/axios.ts`. It exports:
- `apiClient` — Axios instance with base URL + `Content-Type: application/json`
- `get<T>(path)`, `post<T>(path, body?)`, `put<T>(path, body?)`, `del<T>(path)` — typed helpers that automatically unwrap the `{ data: T }` envelope from the backend `ResponseInterceptor`

**Never use `fetch` or create a second Axios instance** for app requests. Always use the typed helpers.

```ts
// services/productService.ts
import { get, post } from './axios'

export const productService = {
  getList: () => get<Product[]>('/products'),
  create: (dto: CreateProductDto) => post<Product>('/products', dto),
}
```

#### Request Interceptor

Automatically attaches the Bearer token from `storage.getAccessToken()` to every request. No manual header management needed in services.

#### Response Interceptor (Silent Refresh)

On `401` responses:
1. **Checks `Authorization` header presence** — if the original request had no Bearer token (e.g., login, OTP verify), the 401 is a business error, not a session expiry. Rejects immediately with `ApiError` so the caller can display it.
2. If request was authenticated, reads refresh token from `storage.getRefreshToken()`
3. If no refresh token → clears tokens, redirects to `/login`
4. Calls `POST /auth/refresh` via a bare `refreshClient` (no interceptors — avoids loops)
5. Uses a singleton `refreshPromise` — concurrent 401s wait on the same refresh call
6. Retries the original request with the new token
7. If refresh fails → clears tokens, redirects to `/login`

The `_retry` flag on the config prevents a retry loop if the retried request also returns 401.

**Key rule:** Only authenticated requests (those with `Authorization: Bearer <token>`) trigger the refresh/redirect logic. Unauthenticated requests that receive 401 (wrong OTP, bad credentials) propagate the error normally — the page's `onError` handler displays it.

### Error Handling

```ts
// utils/apiError.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {}
}

export function resolveApiError(err: unknown, t: TFunction): string
// Returns a translated user-facing message based on err.code → errors.json key,
// falling back to err.message, then a generic 'errors.unknown' key.
```

**Pattern in mutation `onError` handlers:**
```tsx
import { resolveApiError } from '@/utils/apiError'
import { useTranslation } from 'react-i18next'

const { t } = useTranslation(['auth', 'errors'])
const { mutate, isPending } = useLogin()

const onSubmit = (data) => {
  mutate(data, {
    onError: (err) => setError(resolveApiError(err, t)),
  })
}
```

**i18n error codes** (in `locales/{vi,en}/errors.json`):
`PHONE_ALREADY_EXISTS`, `PHONE_NOT_FOUND`, `OTP_INVALID`, `OTP_EXPIRED`, `OTP_PURPOSE_MISMATCH`, `INVALID_CREDENTIALS`, `PASSWORD_MISMATCH`, `REFRESH_TOKEN_INVALID`, `RATE_LIMIT_EXCEEDED`, `unknown`

### Token Storage (nativeStorage)

Tokens are stored via `utils/storage.ts`. It uses `nativeStorage` from `zmp-sdk` inside the Zalo container and falls back to `localStorage` in browser dev and tests.

**Platform detection:** `window.APP_ID` is set by the Zalo container before the mini app boots — it is `undefined` in a plain browser tab or test runner. The check runs once at module load, not per call.

```ts
import { storage } from '@/utils/storage'

storage.getAccessToken()              // string | null
storage.getRefreshToken()             // string | null
storage.setTokens(access, refresh)    // persist both tokens
storage.clearTokens()                 // remove both tokens
```

**Rules:**
- Never read/write tokens directly — always use `storage.*`
- `storage.clearTokens()` is called automatically by the response interceptor and `clearAuth()` on logout
- Do NOT set `window.APP_ID` in tests unless deliberately mocking the Zalo environment — it routes all storage calls to `nativeStorage`, which throws outside Zalo
- Do NOT store other sensitive data in nativeStorage without a similar wrapper

### State (Zustand)

One store file per domain. Use for **client/UI state only** — not server data.

**Auth store shape:**
```ts
// store/useAuthStore.ts
interface AuthState {
  user: User | null
  isReady: boolean         // true once rehydration attempt is complete
  setAuth: (user: User) => void    // sets user + isReady = true
  clearAuth: () => void            // clears tokens + sets user = null
}
```

`isReady` gates the app: `ProtectedRoute` renders `null` while `!isReady` to prevent a flash of the login page during rehydration.

```ts
// Other stores follow the same pattern
import { create } from 'zustand'

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
}))
```

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

Use `@tanstack/react-query` for all data fetching. Mutations return `isPending` — use it for button loading state instead of `useState`.

```ts
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: productService.getList })
}
```

Auth mutations live in `hooks/useAuth.ts` — see `src/hooks/CLAUDE.md` for the full catalogue.

### Forms (react-hook-form + zod)

Define a zod schema, then pass it via `zodResolver`. Keep schemas co-located with the form or in `src/types/`.

```ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = (t: TFunction) => z.object({
  phone: z.string().regex(/^0\d{9}$/, t('validation.phone')),
  password: z.string().min(6, t('validation.passwordMin')),
})
```

### Button Loading State

The `Button` component accepts a `loading?: boolean` prop. When `true`, it shows an SVG spinner and applies `pointer-events-none` to prevent double-submission:

```tsx
<Button loading={isPending} type="submit">
  {t('login.submit')}
</Button>
```

**Always pass `isPending` from the mutation to the submit button.** Never manage loading state manually with `useState`.

### Zalo SDK
Always wrap `zmp-sdk` calls in a custom hook using lazy `import()` — never import at module level.
```ts
// hooks/useZaloUser.ts
import { useEffect, useState } from 'react'

export function useZaloUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    import('zmp-sdk').then(({ getUserInfo }) => getUserInfo().then(setUser))
  }, [])
  return user
}
```

## Commands

```bash
npm run start       # Dev server via zmp start (localhost:3000)
npm run login       # Authenticate with Zalo (zmp login)
npm run deploy      # Build & deploy to Zalo (zmp deploy)
npm run test        # Run unit/component tests with Vitest
npx playwright test # Run E2E tests
npx playwright test --ui  # Run E2E tests with interactive UI
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| react / react-dom | UI framework |
| react-router-dom | Client-side routing |
| zustand | Client state management |
| @tanstack/react-query | Server state, async data fetching & caching |
| axios | HTTP client (with interceptors for auth + error normalization) |
| react-hook-form + @hookform/resolvers | Form state management |
| zod | Schema validation (forms) |
| react-i18next + i18next | Internationalization (VI + EN, namespaces: common, auth, errors) |
| zmp-sdk | Zalo Mini App SDK — required platform dep, lazy import only |
| zmp-ui | Zalo UI components — required platform dep, import when needed |
| zmp-vite-plugin | Zalo Vite plugin — required for Mini App to build and run, do NOT remove |
| vite + @vitejs/plugin-react | Build tooling |
| tailwindcss | Styling |
| vitest + @testing-library/react + @testing-library/jest-dom | Unit & component testing |
| playwright + @playwright/test | End-to-end testing |

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

### Unit / Component Tests

- **Framework**: Vitest + React Testing Library + @testing-library/jest-dom
- **Run all tests**: `npm run test`
- **Run single file**: `npx vitest run path/to/file.test.tsx`
- **Test location**: Co-located as `*.test.tsx` next to source files
- **TDD**: RED → GREEN → REFACTOR
- **TypeScript globals**: `globals: true` in `vite.config.mts` makes `describe`/`it`/`expect`/`vi` available at runtime. `"vitest/globals"` in `tsconfig.json` `types` array makes them visible to the type checker and IDE. Do NOT install `@types/jest` — it conflicts with Vitest.

**Wrapping with QueryClientProvider (required for any component using hooks):**

Any component that calls a TanStack Query hook (`useMutation`, `useQuery`) must be rendered inside a `QueryClientProvider`. Create a fresh client per test to avoid state bleed:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const renderPage = () => {
  const Wrapper = createWrapper()
  return render(<Wrapper><MemoryRouter><MyPage /></MemoryRouter></Wrapper>)
}
```

**Mocking the service layer for mutation tests:**

Mock `@/services/authService` (or any service) rather than mocking the hook module. This lets real TanStack Query lifecycle run (`isPending`, `isSuccess`, `isError`) while preventing real HTTP calls:

```tsx
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      accessToken: 'token', refreshToken: 'refresh',
      user: { id: '1', phone: '0901234567', name: 'Test', role: 'customer' },
    }),
    requestRegisterOtp: vi.fn().mockResolvedValue(undefined),
    // add only methods called by the component under test
  },
}))
```

**Mocking TanStack Query mutations (alternative — use when testing hook behaviour directly):**
```tsx
// Mock the entire hook module
vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))
```

**Mocking navigation:**
```tsx
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
```

**Mocking i18n** (makes assertions language-neutral):
```tsx
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
```

**Testing pages with `isPending`:**
```tsx
vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: true }),
}))

render(<LoginPage />)
expect(screen.getByRole('button', { name: 'login.submit' })).toBeDisabled()
```

### E2E Tests (Playwright)

- **Run**: `npx playwright test`
- **Run with UI**: `npx playwright test --ui`
- **Test location**: `e2e/`

**Auth flow patterns:**

```ts
// Seed test tokens before visiting protected pages
await page.evaluate(() => {
  localStorage.setItem('accessToken', 'test-token')
  localStorage.setItem('refreshToken', 'test-refresh')
})
await page.goto('/')

// Test a full register flow
await page.goto('/register')
await page.fill('input[name="phone"]', '0901234567')
await page.click('button[type="submit"]')
// → should navigate to /otp
await expect(page).toHaveURL('/otp')
```

**API mocking in E2E:**
```ts
await page.route('**/auth/login', (route) =>
  route.fulfill({
    status: 200,
    body: JSON.stringify({
      data: {
        accessToken: 'tok',
        refreshToken: 'ref',
        user: { id: '1', phone: '0901234567', name: 'Test', role: 'customer' },
      },
    }),
  }),
)
```

## Zalo Safe Area

The app runs inside a Zalo iframe with `statusBar: "transparent"` and `actionBarHidden: true` (`app-config.json`). The OS status bar and Zalo's own chrome strip overlap the top of the viewport. Use these CSS custom properties (defined by `zmp-ui` and `src/css/app.css`) to offset UI elements correctly:

| Variable | Value | Covers |
|---|---|---|
| `--zaui-safe-area-inset-top` | `env(safe-area-inset-top, 0px)` | OS status bar height |
| `--zaui-safe-area-inset-bottom` | `env(safe-area-inset-bottom, 0px)` | Home indicator / Android nav |
| `--zalo-chrome-top` | `calc(--zaui-safe-area-inset-top + 2.6rem)` | OS status bar **+** Zalo chrome strip |

**Rules:**
- Use `--zalo-chrome-top` for anything that must clear both the OS status bar and the Zalo chrome strip (e.g. `AuthLayout` floating controls)
- Use `--zaui-safe-area-inset-top` / `.pt-safe` for content that only needs to clear the OS status bar (e.g. `AppLayout` page content)
- Use `--zaui-safe-area-inset-bottom` / `.pb-safe` for content that must clear the bottom home indicator (e.g. `BottomNav`)
- All variables default to `0px` outside the Zalo platform — no special handling needed for browser dev or tests

**Important:** `--zaui-safe-area-inset-top` covers the OS status bar only. Even with `actionBarHidden: true`, Zalo renders a thin mini-app controls strip (~2.6rem above content) that is NOT captured by `env(safe-area-inset-top)`. Use `--zalo-chrome-top` whenever you need to clear this strip.

## Zalo Platform Dependencies

These three packages are **required infrastructure** for Zalo Mini App — never remove them:

| Package | Why Required |
|---|---|
| `zmp-sdk` | Provides Zalo APIs (auth, payment, sharing, etc.) |
| `zmp-ui` | Zalo-native UI components (matches platform look & feel) |
| `zmp-vite-plugin` | Vite plugin that enables `zmp start` / `zmp deploy` to work |

**Usage rules:**
- `zmp-vite-plugin` — configured in `vite.config.mts`, never imported in app code
- `zmp-sdk` — always use lazy `import()` in a custom hook, never at module top level
- `zmp-ui` — import components directly when needed for Zalo-native UI
