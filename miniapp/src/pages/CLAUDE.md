# Page Conventions

## Folder Structure

Simple pages (single file):
```
src/pages/
└── home.tsx
```

Complex pages (folder):
```
src/pages/auth/
└── login/
    ├── index.tsx       ← default export, the page component
    ├── schema.ts       ← zod validation schema (if the page has a form)
    └── Login.test.tsx  ← co-located tests
```

Use a folder when the page has a form (needs `schema.ts`) or multiple sub-components.

## i18n Rule

**Zero hardcoded strings in pages.** Every visible string comes from `useTranslation`.

```tsx
// ✅ correct
const { t } = useTranslation('auth')
<h1>{t('login.title')}</h1>

// ❌ wrong
<h1>Sign in</h1>
```

Both `src/locales/vi/*.json` and `src/locales/en/*.json` must be updated whenever a new key is added.

## Form Conventions

- **Always** use `react-hook-form` + `zod` resolver — no uncontrolled forms, no manual validation
- Schema lives in `schema.ts` co-located with the page, exported as a factory `(t) => z.object(...)`
- Use the `t` function from `useTranslation('common')` to produce validation messages inside the schema
- Field errors display via the component's `error` prop (Input, PasswordInput, etc.)

```ts
// schema.ts
export const loginSchema = (t: (k: string) => string) =>
  z.object({
    phone: z.string().regex(/^0[0-9]{9}$/, t('validation.phone')),
    password: z.string().min(6, t('validation.passwordMin')),
  })
```

## Auth Guard Rules

- **Auth pages** (`/login`, `/register`, etc.): If `useAuthStore().user` is set, redirect to `/`
- **App pages** (`/`, `/products`, etc.): Guarded by `ProtectedRoute`:
  - `!isReady` → render `null` (splash is shown by `AuthProvider` above)
  - `isReady && !user` → redirect to `/login`
  - `isReady && user` → render the outlet
- Pages that receive context via router state (`/otp`, `/new-password`, `/register/complete`) must redirect to `/login` if router state is missing — these pages cannot be reached directly

## Component Usage

- Import UI components from `@/components/ui` — never build raw HTML UI inline
- Import shared components from `@/components/shared`
- All API calls go through `src/services/` — never fetch directly in pages

## Page Export

- Page component is always the **default export**
- Name it after the page: `export default function LoginPage()`

## Testing

- Test files co-located as `<PageName>.test.tsx`
- Mock `react-router-dom`'s `useNavigate` to assert navigation
- Mock `react-i18next` so `t(key)` returns the key — makes assertions language-neutral
- Mock heavy components (PasswordInput, OtpInput) to avoid dynamic import issues in tests

### QueryClientProvider (required)

Any page that uses a TanStack Query hook must be wrapped with `QueryClientProvider`. Use a fresh `QueryClient` per test (no-retry to avoid hanging on failures):

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
```

### Mocking services for mutation tests

Mock `@/services/<name>Service` directly — do NOT mock the hook module. This keeps real TanStack Query lifecycle (`isPending`, `isSuccess`, `isError`) intact while preventing real HTTP calls:

```tsx
vi.mock('@/services/authService', () => ({
  authService: {
    requestForgotPasswordOtp: vi.fn().mockResolvedValue(undefined),
    verifyOtp: vi.fn().mockResolvedValue({ otpToken: 'test-token' }),
    // include only the methods the component calls
  },
}))
```

After a mutation resolves, TanStack Query sets `isSuccess: true` and triggers a re-render — use `waitFor` when asserting post-mutation state:

```tsx
await userEvent.click(submitButton)
await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otp', expect.anything()))
```

### Router state pages

Pages that require router state (`/otp`, `/register/complete`, `/new-password`) guard against direct access. Tests must pass the required state:

```tsx
// ✅ correct — provides required state
renderNewPwd({ phone: '0901234567', otpToken: 'test-token' })

// ❌ wrong — component redirects, no fields rendered
renderNewPwd({ phone: '0901234567' })
```
