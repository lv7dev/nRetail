## Why

Auth pages are fully built with stubs (`setTimeout` placeholders). The backend auth API is complete and ready. This change wires the two together: replacing every stub with real API calls through a proper Axios + TanStack Query + service-layer architecture.

## What Changes

- Install `axios`; configure an instance with request/response interceptors (auth header injection, 401 silent refresh, error normalization)
- Replace `services/api.ts` (raw `fetch`) with `services/axios.ts` (Axios instance) and add `services/authService.ts` (typed auth API functions)
- Add `utils/apiError.ts`: `ApiError` class + `resolveApiError(err, t)` utility for centralized error display
- Add `hooks/useAuth.ts`: TanStack Query mutations/query for all auth operations (`useLogin`, `useRequestOtp`, `useVerifyOtp`, `useRegister`, `useResetPassword`, `useLogout`, `useMe`)
- Expand `types/auth.ts`: `User`, `TokenPair`, all auth response shapes
- Expand `store/useAuthStore.ts`: add `isReady`, `setAuth`, `clearAuth`; tokens stored in `nativeStorage`
- Add `components/AuthProvider.tsx`: rehydration wrapper — calls `GET /auth/me` on init using stored token; shows `SplashPage` until ready
- Add `pages/splash/index.tsx`: centered logo + spinner shown during rehydration
- Restructure register flow into 3 steps: phone-only → OTP → complete form (name + password)
- Add `pages/auth/register/complete.tsx` and route `/register/complete`
- Update OTP page to carry `otpToken` forward in router state after verification
- Update `new-password` page to receive and use `otpToken` from router state
- Add `Button` `loading` prop: spinner + auto-disable while mutation is pending; eliminates manual `useState(loading)` in every form page
- Add `locales/en/errors.json` + `locales/vi/errors.json`: all backend error codes mapped to user-facing messages

## Capabilities

### New Capabilities

- `axios-client`: Axios instance with request interceptor (Bearer token injection) and response interceptor (401 silent refresh, error normalization)
- `auth-api-integration`: Frontend auth flows fully connected to backend — login, register (3-step), forgot-password (3-step), OTP verification, token refresh, logout
- `api-error-handling`: Centralized error resolution via `resolveApiError(err, t)` + `errors.json` i18n catalog; all API errors display translated user-facing messages
- `app-rehydration`: On app start, access token is read from `nativeStorage`; `GET /auth/me` rehydrates user state; `SplashPage` shown until ready; expired/missing tokens redirect to login

### Modified Capabilities

- `api-client`: Switching from raw `fetch` wrapper to Axios instance — same `get/post/put/del` surface but with interceptors and typed error handling
- `state-management`: `useAuthStore` gains `isReady`, `setAuth(user, accessToken, refreshToken)`, `clearAuth()`; tokens move from Zustand to `nativeStorage`

## Impact

- `miniapp/package.json` — add `axios`
- `miniapp/src/services/` — `api.ts` replaced by `axios.ts` + `authService.ts`
- `miniapp/src/hooks/useAuth.ts` — new file
- `miniapp/src/utils/apiError.ts` — new file
- `miniapp/src/store/useAuthStore.ts` — expanded
- `miniapp/src/types/auth.ts` — expanded
- `miniapp/src/components/AuthProvider.tsx` — new file
- `miniapp/src/components/ui/Button/Button.tsx` — add `loading` prop
- `miniapp/src/pages/splash/index.tsx` — new file
- `miniapp/src/pages/auth/register/` — `index.tsx` trimmed to phone-only; `complete.tsx` added
- `miniapp/src/pages/auth/otp/index.tsx` — real verify call, passes `otpToken` in state
- `miniapp/src/pages/auth/new-password/index.tsx` — reads `otpToken` from state
- `miniapp/src/app.tsx` — wrap routes in `<AuthProvider>`, add `/register/complete` route
- `miniapp/src/locales/en/errors.json` + `vi/errors.json` — new files
- No backend changes required
