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
  });
```

## Auth Guard Rules

Route protection uses two guards in series:

```
ProtectedRoute  →  OutletGuard  →  AppLayout  →  app pages
```

- **Auth pages** (`/login`, `/register`, etc.): If `useAuthStore().user` is set, redirect to `/`
- **Outlet picker** (`/outlets`): Sits inside `ProtectedRoute` but **not** inside `OutletGuard` — users must be able to reach it without an outlet selected
- **App pages** (`/`, `/products`, etc.): Guarded by `ProtectedRoute` then `OutletGuard`:
  - `ProtectedRoute`: `!isReady` → render `null`; `!user` → redirect to `/login`; else → render outlet
  - `OutletGuard`: `!selectedOutlet` → redirect to `/outlets`; else → render outlet
- **`/outlets` (OutletListPage)** behaviour:
  - 0 outlets → show empty state + logout button
  - 1 outlet → auto-select and navigate to `/` (no list shown)
  - N outlets → show list; tap to select and navigate to `/`
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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
}));
```

After a mutation resolves, TanStack Query sets `isSuccess: true` and triggers a re-render — use `waitFor` when asserting post-mutation state:

```tsx
await userEvent.click(submitButton);
await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otp', expect.anything()));
```

### Mocking PasswordInput (form tests)

`PasswordInput` uses a dynamic SVG import that fails in jsdom. Mock it inline in each test file. **Always use `forwardRef`** so react-hook-form's `register()` ref attaches correctly — without it, `handleSubmit` reads empty field values.

```tsx
import { forwardRef } from 'react';

vi.mock('@/components/ui/PasswordInput/PasswordInput', () => ({
  PasswordInput: forwardRef<
    HTMLInputElement,
    { label?: string; error?: string; [k: string]: unknown }
  >(({ label, error, ...props }, ref) => (
    <div>
      {label && <label>{label}</label>}
      <input type="password" aria-label={label ?? 'password'} ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )),
}));
```

> **v8 ignore note:** If `forwardRef` is imported at the top level but used inside a `vi.mock` factory, use `require('react').forwardRef` inside the factory instead — the factory is hoisted before imports execute.

### Querying unlabeled inputs

`Input` and `PasswordInput` do not associate `<label>` with `<input>` via `htmlFor`/`id`, so `getByRole('textbox', { name: /label/i })` fails. Use `document.querySelector` instead:

```tsx
const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
await userEvent.type(nameInput, 'Alice');
```

### Router state pages

Pages that require router state (`/otp`, `/register/complete`, `/new-password`) guard against direct access. Tests must pass the required state:

```tsx
// ✅ correct — provides required state
renderNewPwd({ phone: '0901234567', otpToken: 'test-token' });

// ❌ wrong — component redirects, no fields rendered
renderNewPwd({ phone: '0901234567' });
```
