## 1. Install Axios

- [x] 1.1 Run `npm install axios` in `miniapp/`

## 2. Foundation — Types, Storage, Error Utilities

- [x] 2.1 Expand `src/types/auth.ts`: add `User` (`id, phone, name, role`), `TokenPair`, `AuthResponse`, `OtpVerifyResponse`
- [x] 2.2 Create `src/utils/storage.ts`: thin wrapper around `nativeStorage.getItem / setItem / removeItem` for token keys (`accessToken`, `refreshToken`)
- [x] 2.3 Create `src/utils/apiError.ts`: `ApiError` class (`status`, `message`, `code`) + `resolveApiError(err, t)` utility
- [x] 2.4 Create `src/locales/en/errors.json`: all auth error codes (`PHONE_ALREADY_EXISTS`, `PHONE_NOT_FOUND`, `OTP_INVALID`, `OTP_EXPIRED`, `OTP_PURPOSE_MISMATCH`, `INVALID_CREDENTIALS`, `PASSWORD_MISMATCH`, `REFRESH_TOKEN_INVALID`, `RATE_LIMIT_EXCEEDED`, `unknown`)
- [x] 2.5 Create `src/locales/vi/errors.json`: Vietnamese translations for all error codes from 2.4

## 3. Axios Instance + Interceptors

- [x] 3.1 Create `src/services/axios.ts`: Axios instance with `baseURL` from `VITE_API_BASE_URL`
- [x] 3.2 Add request interceptor: read `accessToken` from storage, attach `Authorization: Bearer` header
- [x] 3.3 Add response interceptor: on 401, attempt silent refresh via a separate bare Axios instance (no interceptors), store new tokens, retry original request
- [x] 3.4 Add `_retry` flag to request config to prevent infinite refresh loops
- [x] 3.5 Add refresh singleton (`refreshPromise`) to prevent concurrent refresh calls
- [x] 3.6 Add error normalizer in response interceptor: extract `{ message, code }` from error body, throw `ApiError`
- [x] 3.7 On refresh failure: call `clearAuth()` and `window.location.replace('/login')`
- [x] 3.8 Export typed `get`, `post`, `put`, `del` helpers wrapping the Axios instance (mirrors old `api.ts` surface)

## 4. Auth Service Layer

- [x] 4.1 Create `src/services/authService.ts`: typed functions — `login`, `requestRegisterOtp`, `requestForgotPasswordOtp`, `verifyOtp`, `register`, `resetPassword`, `refresh`, `logout`, `getMe`

## 5. Auth Store — Expand

- [x] 5.1 Update `src/store/useAuthStore.ts`: add `isReady: boolean` (default `false`), replace `setUser/clearUser` with `setAuth(user)` and `clearAuth()`
- [x] 5.2 `setAuth(user)`: set `user` + `isReady = true`
- [x] 5.3 `clearAuth()`: set `user = null`, remove tokens from storage via `storage.ts`

## 6. TanStack Query Hooks

- [x] 6.1 Create `src/hooks/useAuth.ts`
- [x] 6.2 Add `useLogin()`: mutation → `authService.login` → `setAuth` on success
- [x] 6.3 Add `useRequestOtp(flow)`: mutation → `requestRegisterOtp` or `requestForgotPasswordOtp` based on flow
- [x] 6.4 Add `useVerifyOtp()`: mutation → `authService.verifyOtp` → returns `otpToken`
- [x] 6.5 Add `useRegister()`: mutation → `authService.register` → `setAuth` on success
- [x] 6.6 Add `useResetPassword()`: mutation → `authService.resetPassword`
- [x] 6.7 Add `useLogout()`: mutation → `authService.logout` → `clearAuth` on success or error (best-effort)
- [x] 6.8 Add `useMe()`: query → `authService.getMe`, `enabled: false` (used only by AuthProvider imperatively)

## 7. Button — Loading Prop

- [x] 7.1 Add `loading?: boolean` prop to `Button` component interface
- [x] 7.2 When `loading` is `true`: render inline SVG spinner (Tailwind `animate-spin`) before label text, set `disabled`, add `pointer-events-none`

## 8. Splash Page + AuthProvider

- [x] 8.1 Create `src/pages/splash/index.tsx`: centered logo/app name + `animate-spin` spinner, no navigation controls
- [x] 8.2 Create `src/components/AuthProvider.tsx`: on mount, read `accessToken` from storage; if none → `setAuth`-less path, just set `isReady = true`; if present → call `authService.getMe()` → `setAuth(user)` or `clearAuth()` → `isReady = true`
- [x] 8.3 Update `src/components/shared/ProtectedRoute.tsx`: read `isReady` from store; if `!isReady` render `null`

## 9. Register Flow Restructure

- [x] 9.1 Trim `src/pages/auth/register/index.tsx` to phone-only form: replace current form with single phone input, call `useRequestOtp('register')`, navigate to `/otp` on success
- [x] 9.2 Update `register/schema.ts`: keep only `phoneSchema` for step 1; add `registerCompleteSchema` for step 3 (name + password + confirmPassword)
- [x] 9.3 Add `register.name` key to `src/locales/en/auth.json` ("Full name") and `src/locales/vi/auth.json`
- [x] 9.4 Create `src/pages/auth/register/complete.tsx`: reads `{ phone, otpToken }` from router state; guard → redirect `/login` if missing; form with Full name + password + confirmPassword; calls `useRegister()`; navigates to `/` on success
- [x] 9.5 Add route `/register/complete` to `src/app.tsx` inside `<AuthLayout>`

## 10. OTP Page — Real Verification + State Threading

- [x] 10.1 Update `src/pages/auth/otp/index.tsx` `handleComplete`: call `useVerifyOtp()` with `{ phone, otp }`
- [x] 10.2 On success (register flow): navigate to `/register/complete` with `state: { phone, otpToken }`
- [x] 10.3 On success (forgot flow): navigate to `/new-password` with `state: { phone, otpToken }`
- [x] 10.4 Update `handleResend`: call `useRequestOtp(state.flow)` with `state.phone`
- [x] 10.5 Wire `useVerifyOtp().isPending` to `OtpInput` / loading indicator; wire resend mutation's `isPending` to resend button

## 11. Forgot-Password + New-Password Pages

- [x] 11.1 Update `src/pages/auth/forgot-password/index.tsx`: call `useRequestOtp('forgot')`, navigate to `/otp` on success, display errors via `resolveApiError`
- [x] 11.2 Update `src/pages/auth/new-password/index.tsx`: read `otpToken` from router state (guard → redirect if missing), call `useResetPassword()`, navigate to `/login` on success, display errors

## 12. Login Page

- [x] 12.1 Update `src/pages/auth/login/index.tsx`: replace stub with `useLogin()`, remove manual `loading` state, pass `isPending` to `Button loading` prop, display errors via `resolveApiError`

## 13. App.tsx Wiring

- [x] 13.1 Wrap route tree in `<AuthProvider>` in `src/app.tsx`: render `<SplashPage />` when `!isReady`, render routes when ready
- [x] 13.2 Add `/register/complete` route inside `<AuthLayout>`
- [x] 13.3 Register `errors` namespace in `src/i18n.ts` so `t('errors.XYZ')` resolves correctly

## 14. Cleanup

- [x] 14.1 Remove `src/services/api.ts` (replaced by `axios.ts`)
- [x] 14.2 Remove all manual `const [loading, setLoading] = useState(false)` from auth pages (replaced by `isPending`)
