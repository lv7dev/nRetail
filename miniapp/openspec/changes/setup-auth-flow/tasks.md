## 1. i18n Infrastructure

- [ ] 1.1 Install `react-i18next`, `i18next`, `i18next-browser-languagedetector` (`npm install react-i18next i18next i18next-browser-languagedetector`)
- [ ] 1.2 Create `src/i18n.ts` initializing i18next with language detector, namespaces `auth` and `common`, fallback `vi`
- [ ] 1.3 Create `src/locales/vi/auth.json` and `src/locales/en/auth.json` with all auth page strings
- [ ] 1.4 Create `src/locales/vi/common.json` and `src/locales/en/common.json` with shared strings (buttons, validation errors, nav labels)
- [ ] 1.5 Import `src/i18n.ts` in `src/app.tsx` before component render

## 2. Router & Layout Restructure

- [ ] 2.1 Rename `src/components/layout.tsx` → `src/components/AppLayout.tsx`, convert to use `<Outlet />` instead of importing pages directly
- [ ] 2.2 Create `src/components/AuthLayout.tsx` — centered full-height container with `<Outlet />` and `LanguageSwitcher` positioned top-right
- [ ] 2.3 Create `src/components/shared/ProtectedRoute.tsx` — reads `useAuthStore().user`, redirects to `/login` if null, renders `<Outlet />` if set
- [ ] 2.4 Update router in `src/app.tsx` (or a new `src/components/Router.tsx`): nest auth routes under `AuthLayout`, app routes under `ProtectedRoute > AppLayout`; add redirect from auth routes when already authenticated

## 3. OtpInput Component

- [ ] 3.1 Write failing tests `src/components/ui/OtpInput/OtpInput.test.tsx` covering: renders 6 boxes, auto-advance on digit, ignores non-digits, Backspace goes back, paste fills all, onComplete fires on last digit, onComplete not fired partially, className forwarding
- [ ] 3.2 Implement `src/components/ui/OtpInput/OtpInput.tsx` — array of refs, digit-only filtering, paste handler, onComplete callback
- [ ] 3.3 Create `src/components/ui/OtpInput/index.ts` barrel export

## 4. Alert Component

- [ ] 4.1 Write failing tests `src/components/ui/Alert/Alert.test.tsx` covering: renders message, error/success/info variants, default variant is error, empty message renders null, className forwarding
- [ ] 4.2 Implement `src/components/ui/Alert/Alert.tsx` — three variants using design tokens, returns null when message is empty
- [ ] 4.3 Create `src/components/ui/Alert/index.ts` barrel export

## 5. PasswordInput Component

- [ ] 5.1 Write failing tests `src/components/ui/PasswordInput/PasswordInput.test.tsx` covering: hidden by default, toggle reveals, toggle hides again, eye-slash icon when hidden, eye icon when visible, ref forwarding
- [ ] 5.2 Implement `src/components/ui/PasswordInput/PasswordInput.tsx` — wraps Input, local `visible` state, Icon toggle button
- [ ] 5.3 Create `src/components/ui/PasswordInput/index.ts` barrel export

## 6. LanguageSwitcher Component

- [ ] 6.1 Write failing tests `src/components/shared/LanguageSwitcher/LanguageSwitcher.test.tsx` covering: globe button renders, dropdown opens on click, closes on second click, closes on outside click, active language marked, selecting language calls changeLanguage
- [ ] 6.2 Implement `src/components/shared/LanguageSwitcher/LanguageSwitcher.tsx` — globe Icon button, open/close state, useRef + mousedown outside-click handler, calls `i18n.changeLanguage()`
- [ ] 6.3 Create `src/components/shared/LanguageSwitcher/index.ts` barrel export

## 7. Update UI Barrel Exports

- [ ] 7.1 Update `src/components/ui/index.ts` to re-export `OtpInput`, `Alert`, `PasswordInput`

## 8. Login Page

- [ ] 8.1 Write failing tests `src/pages/auth/login/Login.test.tsx` covering: phone + password fields render, phone validation error, password validation error, Enter submits, register link navigates, forgot-password link navigates, all strings via i18n
- [ ] 8.2 Implement `src/pages/auth/login/index.tsx` — react-hook-form + zod schema, stub submit (setTimeout 1s), useTranslation('auth')
- [ ] 8.3 Create `src/pages/auth/login/schema.ts` with zod validation schema

## 9. Register Page

- [ ] 9.1 Write failing tests `src/pages/auth/register/Register.test.tsx` covering: three fields render, password mismatch error, valid submit navigates to OTP with register flow, Enter submits, back-to-login link
- [ ] 9.2 Implement `src/pages/auth/register/index.tsx` — react-hook-form + zod schema, stub submit, navigate to `/otp` with `{ flow: 'register', phone }`
- [ ] 9.3 Create `src/pages/auth/register/schema.ts` with zod validation schema

## 10. ForgotPassword Page

- [ ] 10.1 Write failing tests `src/pages/auth/forgot-password/ForgotPassword.test.tsx` covering: phone field renders, phone validation error, Enter submits, navigates to OTP with forgot flow, back-to-login link
- [ ] 10.2 Implement `src/pages/auth/forgot-password/index.tsx` — react-hook-form + zod, stub submit, navigate to `/otp` with `{ flow: 'forgot', phone }`
- [ ] 10.3 Create `src/pages/auth/forgot-password/schema.ts` with zod validation schema

## 11. OTP Page

- [ ] 11.1 Write failing tests `src/pages/auth/otp/Otp.test.tsx` covering: missing state redirects to login, OtpInput renders, completing 6 digits triggers submission, forgot flow navigates to new-password, register flow sets user and navigates home, resend shows success Alert
- [ ] 11.2 Implement `src/pages/auth/otp/index.tsx` — reads location.state, redirects if missing, OtpInput onComplete handler, flow-aware navigation, resend action

## 12. NewPassword Page

- [ ] 12.1 Write failing tests `src/pages/auth/new-password/NewPassword.test.tsx` covering: missing state redirects to login, two password fields render, mismatch error, Enter submits, navigates to login on success
- [ ] 12.2 Implement `src/pages/auth/new-password/index.tsx` — react-hook-form + zod, stub submit, navigate to `/login`
- [ ] 12.3 Create `src/pages/auth/new-password/schema.ts` with zod validation schema

## 13. Pages CLAUDE.md & Beads Issue

- [ ] 13.1 Create `src/pages/CLAUDE.md` documenting: folder structure (complex=folder, simple=file), i18n rule (no hardcoded strings), form conventions (react-hook-form + zod, schema in schema.ts), auth guard rules, page is default export
- [ ] 13.2 Run `bd create` to file a beads issue: "Connect auth pages to backend API" — documents all stub locations and what needs replacing when BE is ready
- [ ] 13.3 Run full test suite (`npm run test`) — all tests must pass
