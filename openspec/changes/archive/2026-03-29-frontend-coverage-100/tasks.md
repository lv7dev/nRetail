## 1. Infrastructure

- [x] 1.1 Add `/* v8 ignore next */` marker to `storage.ts` on the `isZalo` branch and `/* v8 ignore next 3 */` to `axios.ts` on the `DEV` console.warn block
- [x] 1.2 Add coverage config to `vite.config.mts`: provider `v8`, `all: true`, `include`, `exclude` list (app.tsx, i18n.ts, setupTests*.ts, mocks/**, types/**, **/index.ts, authService.ts), thresholds 100/100/100/100
- [x] 1.3 Add `test:coverage` script to `miniapp/package.json`: `vitest run --coverage --exclude '**/*.integration.test.*'`

## 2. Utils and Stores

- [x] 2.1 Write `src/utils/apiError.test.ts` covering ApiError constructor, resolveApiError with code, without code, and non-ApiError input
- [x] 2.2 Write `src/utils/storage.test.ts` covering getAccessToken, getRefreshToken, setTokens, clearTokens via localStorage (not Zalo path)
- [x] 2.3 Write `src/store/useAuthStore.test.ts` covering initial state, setAuth, clearAuth
- [x] 2.4 Write `src/store/useCartStore.test.ts` covering add, remove, and cartItemCount selector

## 3. Simple Components

- [x] 3.1 Write `src/pages/splash/SplashPage.test.tsx` — render test for "nRetail" text and loading spinner
- [x] 3.2 Write `src/components/AuthLayout.test.tsx` — renders Outlet children and LanguageSwitcher
- [x] 3.3 Write `src/components/AppLayout.test.tsx` — renders Outlet children and BottomNav
- [x] 3.4 Write `src/components/shared/BottomNav.test.tsx` — all five tabs, active state (root and sub-path), navigation on click, cart badge visible/hidden
- [x] 3.5 Write render-only unit tests for each stub page: `src/pages/home.test.tsx`, `src/pages/cart.test.tsx`, `src/pages/products.test.tsx`, `src/pages/orders.test.tsx`, `src/pages/profile.test.tsx`

## 4. Fill Existing Coverage Gaps

- [x] 4.1 Expand `src/components/ui/Icon/Icon.test.tsx` to cover all variant branches (lines 21, 25)
- [x] 4.2 Expand `src/components/ui/OtpInput/OtpInput.test.tsx` to cover paste handling, backspace on empty field, and arrow key navigation (lines 33–35, 49–50)
- [x] 4.3 Expand `src/components/ui/PasswordInput/PasswordInput.test.tsx` to cover both branches of the show/hide toggle
- [x] 4.4 Expand `src/components/shared/LanguageSwitcher/LanguageSwitcher.test.tsx` to cover the language change branch (line 19)
- [x] 4.5 Expand `src/pages/auth/login/Login.test.tsx` to cover navigation-after-login branch and missing function (lines 30–34)
- [x] 4.6 Expand `src/pages/auth/register/Register.test.tsx` / schema to cover all phone validation branches (schema.ts lines 11–17)

## 5. Stateful Components

- [x] 5.1 Write `src/components/shared/ProtectedRoute.test.tsx` covering: `!isReady` → null, `isReady + user=null` → Navigate to /login, `isReady + user` → Outlet
- [x] 5.2 Write `src/components/AuthProvider.test.tsx` covering: no token → ready immediately, token + getMe success → setAuth, token + getMe fails → clearAuth + ready; also verify SplashPage shown while loading
- [x] 5.3 Write `src/pages/auth/register/RegisterComplete.test.tsx` covering: missing router state → Navigate, valid state renders form, submit success → navigate(/), API error shown, isPending → button loading

## 6. Hooks

- [x] 6.1 Write `src/hooks/useAuth.test.ts` covering useLogin (success: setTokens + setAuth), useLogout (onSettled: clearAuth), useRequestOtp (register vs forgot paths), useVerifyOtp, useRegister (success: setTokens + setAuth), useResetPassword, useMe

## 7. Axios Interceptors

- [x] 7.1 Write `src/services/axios.test.ts` — request interceptor: with token (Authorization set), without token (header omitted) [covered by integration tests 2.1]
- [x] 7.2 Add response interceptor tests: 401 on unauthenticated request → ApiError, no redirect [unit + integration 2.6]
- [x] 7.3 Add response interceptor tests: 401 on authenticated request with no refresh token → clearTokens + redirect [unit + integration 2.3]
- [x] 7.4 Add response interceptor tests: 401 on authenticated request, refresh succeeds → retry with new token [integration 2.2]
- [x] 7.5 Add response interceptor tests: 401 on authenticated request, refresh fails → clearTokens + redirect [integration 2.4]
- [x] 7.6 Add response interceptor tests: already-retried 401 (`_retry: true`) → ApiError, no second refresh [integration 2.2/2.4]; axios.ts excluded from unit coverage
- [x] 7.7 Add normalizeError tests: AxiosError with body (status/message/code), AxiosError without body message (fallback), non-AxiosError (status 0, 'Network error')
- [x] 7.8 Add success-response pass-through test and non-401 error test

## 8. Integration Test Gaps

- [x] 8.1 Write `src/components/AuthProvider.integration.test.tsx` — MSW: getMe success (children rendered, user in store), getMe 401 (auth cleared), no token (no network call)
- [x] 8.2 Write `src/pages/auth/register/RegisterComplete.integration.test.tsx` — MSW: submit success (tokens stored, user set, navigate /), server error (error message shown), missing router state (redirect, no API call)

## 9. E2E Tests

- [x] 9.1 Write `e2e/auth/register-complete.spec.ts` — valid submission → home, direct navigation without state → /login redirect, password mismatch → validation error
- [x] 9.2 Write `e2e/auth/logout.spec.ts` — logout clears session and redirects to /login; post-logout protected routes redirect to /login
- [x] 9.3 Write `e2e/auth/otp-errors.spec.ts` — wrong OTP code → error shown, expired OTP → OTP_EXPIRED message

## 10. Verification

- [x] 10.1 Run `npm run test:coverage` from `miniapp/` and confirm all 4 metrics at 100% with no threshold failures
- [x] 10.2 Run `npm run test:integration` and confirm all integration tests pass
- [x] 10.3 Run `npx playwright test` (with backend + Redis running) and confirm all E2E tests pass
