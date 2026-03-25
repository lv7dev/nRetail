## Context

The miniapp currently has a single `layout.tsx` that renders all routes with `BottomNav`. There are no auth pages, no route protection, and no i18n infrastructure. The auth store (`useAuthStore`) holds `user: User | null` but has no API calls. The backend is not yet available — all auth actions are stubbed for now.

Existing UI primitives: Button, Input, Checkbox, Icon, cn(). New components build on these.

## Goals / Non-Goals

**Goals:**
- Provide a complete auth entry experience (login, register, forgot password, OTP, new password)
- Establish i18n infrastructure (react-i18next, vi/en, auto-detect + persist)
- Split routing into authenticated vs unauthenticated shells
- Keep all auth actions stubbed — no real API calls until BE is ready
- All user-visible strings go through i18next (zero hardcoded strings in pages)

**Non-Goals:**
- Real API integration (deferred — tracked as a beads issue)
- Refresh tokens, token storage, or session persistence
- Social login (Zalo, Google, etc.)
- SMS/phone OTP delivery (BE sends OTP to email derived from phone — temporary)
- Dark mode for auth pages (infrastructure exists, toggle deferred)
- LanguageSwitcher in ProfilePage (deferred to profile feature work)

## Decisions

### 1. Router: nested layout routes (React Router v6 `<Outlet>`)

`AuthLayout` and `AppLayout` use React Router's nested route pattern. Each layout renders `<Outlet />` for its child pages instead of importing them directly. This keeps layouts unaware of which pages they contain.

```
layout.tsx (current)  →  split into:
  AppLayout.tsx           ← renders <Outlet/> + BottomNav
  AuthLayout.tsx          ← renders <Outlet/> + LanguageSwitcher, centered

app-level routing in layout.tsx (the BrowserRouter root):
  /login, /register, etc  → AuthLayout > Outlet
  /, /products, etc       → ProtectedRoute > AppLayout > Outlet
```

**Alternative considered**: Keep one layout and conditionally show/hide BottomNav. Rejected — couples layout logic to route knowledge, harder to extend.

### 2. ProtectedRoute: reads Zustand store, no persistence yet

`ProtectedRoute` checks `useAuthStore().user`. If null → redirect to `/login`. Since there's no real auth yet, login sets a mock user. When BE is wired, the store gains a token + rehydration from localStorage.

**Alternative considered**: Context-based auth. Rejected — Zustand already in use; adding Context creates two state systems.

### 3. i18n: namespace-per-domain, lazy-loaded

Two namespaces: `auth` (all auth page strings) and `common` (buttons, validation messages, nav labels). Loaded eagerly (small files). Language detection order: localStorage → navigator → fallback `vi`.

```ts
// usage in pages
const { t } = useTranslation('auth')
t('login.title')  // "Đăng nhập" / "Sign in"

// common namespace
const { t } = useTranslation('common')
t('button.submit')  // "Xác nhận" / "Submit"
```

**Alternative considered**: Single namespace flat file. Rejected — grows unwieldy as app adds features.

### 4. OTP page: flow context via React Router state

OTP page is shared between register and forgot-password flows. The calling page passes `{ flow: 'register' | 'forgot', phone: string }` via `navigate('/otp', { state: { flow, phone } })`. OTP page reads `useLocation().state`.

After OTP verified:
- `flow === 'register'` → `navigate('/', { replace: true })` (mock login)
- `flow === 'forgot'` → `navigate('/new-password', { state: { phone } })`

**Alternative considered**: Separate `/otp-register` and `/otp-forgot` routes. Rejected — duplicates identical UI for no benefit.

### 5. OtpInput: controlled array of single-char inputs

6 `<input maxLength={1}>` elements, refs array for focus management. Auto-advances on digit input, backtracks on Backspace. On paste: splits clipboard string across all 6 fields. On all 6 filled → calls `onComplete(code)` callback → page submits.

```tsx
<OtpInput length={6} onComplete={(code) => handleSubmit(code)} />
```

**Alternative considered**: Single `<input maxLength={6}>`. Rejected — poor UX, no visual progress.

### 6. PasswordInput: wraps Input, adds toggle button

Renders `Input` with `type="password"` or `type="text"` based on local state. Toggle is an absolute-positioned `<button>` with `<Icon name="eye" />` / `<Icon name="eye-slash" />` inside a relative wrapper div.

### 7. Alert: replaces `window.alert`, shows inline

Variants: `error` (destructive colors), `success` (green), `info` (primary). Receives `message: string` and `variant`. Pages manage their own alert state locally — no global toast system yet.

```tsx
{error && <Alert variant="error" message={error} />}
```

**Alternative considered**: Global toast context. Deferred — overkill for auth pages; add when needed across the full app.

### 8. Language switcher: local dropdown, not a UI primitive

`LanguageSwitcher` manages its own open/close state with a `useRef` + click-outside handler. Calls `i18n.changeLanguage()` on selection. Not extracted as a generic `Dropdown` UI primitive yet — single use case, inline is simpler.

**Alternative considered**: Generic `Dropdown` in `ui/`. Deferred — extract when a second dropdown use case appears.

### 9. Form validation: react-hook-form + zod

All auth forms use `react-hook-form` with `zodResolver`. Schemas co-located in the page folder.

```ts
// Login schema
const schema = z.object({
  phone: z.string().regex(/^0[0-9]{9}$/, t('validation.phone')),
  password: z.string().min(6, t('validation.passwordMin')),
})
```

Enter key submits all forms (native `<form>` submit behavior).

### 10. Stub pattern for API calls

While BE is unavailable, each form's submit handler logs the payload and simulates a 1-second delay with `setTimeout`. A comment block marks every stub:

```ts
// TODO(BE): replace with real API call
// Tracked: beads issue nretail-xxx
await new Promise(r => setTimeout(r, 1000)) // stub
```

## Risks / Trade-offs

- **[Risk]** OTP auto-submit fires before user intends if pasting a non-OTP clipboard string → Mitigation: validate that all 6 chars are digits before calling `onComplete`
- **[Risk]** `location.state` is lost on hard refresh of `/otp` page → Mitigation: redirect to `/login` if state is missing
- **[Risk]** Language switcher open state doesn't close on outside click without careful ref handling → Mitigation: `useEffect` with `mousedown` listener on `document`
- **[Risk]** Stub auth lets any phone/password through — not suitable for production → Mitigation: clearly documented, tracked as beads issue, no security implication until BE wired
- **[Risk]** i18n strings drift between vi/en as features are added → Mitigation: document convention in `pages/CLAUDE.md` that both locale files must be updated together

## Open Questions

- None blocking implementation. Deferred items tracked as beads issues.
