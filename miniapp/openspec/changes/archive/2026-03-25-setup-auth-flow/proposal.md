## Why

The miniapp has no authentication flow — users can access all pages without logging in. Before any real feature (cart, orders, profile) can work, we need a complete auth entry point: login, registration, password recovery, and OTP verification. Additionally, the app currently has no i18n infrastructure, so all strings are hardcoded in one language.

## What Changes

- Add `react-i18next` with Vietnamese and English translations
- Restructure the router into two layouts: `AuthLayout` (no nav, centered) and `AppLayout` (with BottomNav)
- Add `ProtectedRoute` to guard app pages — redirects to `/login` if unauthenticated
- Add three new UI components: `OtpInput`, `Alert`, `PasswordInput`
- Add `LanguageSwitcher` shared component (globe icon → dropdown, VI/EN)
- Implement five auth pages: Login, Register, ForgotPassword, OTP, NewPassword
- Add `src/pages/CLAUDE.md` defining page conventions
- Create a beads issue tracking BE integration work (auth API not yet available)

## Capabilities

### New Capabilities

- `i18n-setup`: react-i18next configuration, locale files (vi/en), language detection and persistence
- `auth-layout`: AuthLayout component with LanguageSwitcher, AppLayout refactor, ProtectedRoute
- `ui-otp-input`: 6-digit OTP input with auto-advance, paste handling, auto-submit callback
- `ui-alert`: Inline feedback component with error/success/info variants
- `ui-password-input`: Password input with show/hide toggle using Icon
- `language-switcher`: Globe icon + dropdown for VI/EN switching, used in AuthLayout
- `page-login`: Login page — phone + password form, link to register and forgot-password
- `page-register`: Register page — phone + password + confirm password
- `page-forgot-password`: ForgotPassword page — phone input, triggers OTP flow
- `page-otp`: OTP verification page — 6-digit auto-submit, flow-aware (forgot | register)
- `page-new-password`: New password page — password + confirm, shown after OTP verified

### Modified Capabilities

- `component-conventions`: No requirement changes — page conventions are captured in a new `pages/CLAUDE.md` doc, not as a spec modification

## Impact

- **New dependencies**: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- **Router**: `layout.tsx` split into `AppLayout.tsx` + `AuthLayout.tsx`; all existing routes still work
- **Auth store**: Stays thin (`user: User | null`) — no BE calls yet; BE integration tracked separately
- **`User` type**: No changes now; expansion deferred to BE integration
- **Vietnamese phone validation**: `zod` regex `/^0[0-9]{9}$/` (10 digits, starts with 0)
- **OTP flow**: Phone and flow context passed via React Router `location.state` between pages
