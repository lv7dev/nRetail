# Services

API calls live in `src/services/`. Never call `fetch` or Axios directly from components or hooks — always go through a service function.

## Files

| File | Purpose |
|------|---------|
| `axios.ts` | Configured Axios instance, interceptors, typed helpers |
| `authService.ts` | Auth API calls (login, OTP, register, reset, logout, me) |

## axios.ts — HTTP Client

Exports `apiClient` (the main instance) and typed helpers: `get<T>`, `post<T>`, `put<T>`, `del<T>`. All helpers automatically unwrap the backend's `{ data: T }` envelope.

### Request interceptor

Attaches `Authorization: Bearer <token>` from storage to every outgoing request. If no token is in storage, the header is omitted.

### Response interceptor — 401 handling

The interceptor distinguishes two 401 sources:

| Request had `Authorization` header? | Meaning | Behaviour |
|--------------------------------------|---------|-----------|
| Yes (authenticated request) | Session expired | Attempt silent token refresh; on failure clear tokens + redirect to `/login` |
| No (unauthenticated request) | Business error (wrong OTP, bad credentials) | Reject with `ApiError` immediately — **no redirect, no token clear** |

This means auth-flow endpoints (`/auth/login`, `/auth/otp/verify`, `/auth/reset-password`) can return 401 safely and the page's `onError` handler will receive the error for display.

### Silent refresh details

- Uses a separate bare `refreshClient` (no interceptors) to call `POST /auth/refresh`
- Singleton `refreshPromise` prevents concurrent refresh calls
- `_retry` flag on request config prevents infinite loops
- On refresh success: stores new tokens, retries original request
- On refresh failure or no refresh token: `storage.clearTokens()` + `window.location.replace('/login')`

### Error normalisation

All errors are converted to `ApiError { status, message, code }` before rejection. The `code` field maps to `locales/{vi,en}/errors.json` for i18n display.

## authService.ts — Auth API

Thin wrappers over `post<T>` / `get<T>`. Every method corresponds to one backend endpoint.

```ts
authService.login(phone, password)            → POST /auth/login
authService.requestRegisterOtp(phone)         → POST /auth/otp/register
authService.requestForgotPasswordOtp(phone)   → POST /auth/otp/forgot-password
authService.verifyOtp(phone, otp)             → POST /auth/otp/verify  → { otpToken }
authService.register(otpToken, name, pw, cpw) → POST /auth/register
authService.resetPassword(otpToken, npw, cpw) → POST /auth/reset-password
authService.refresh(refreshToken)             → POST /auth/refresh
authService.logout(refreshToken)              → POST /auth/logout
authService.getMe()                           → GET  /auth/me
```

## Adding a New Service

```ts
// services/productService.ts
import { get, post } from './axios'
import type { Product } from '@/types/product'

export const productService = {
  getList: () => get<Product[]>('/products'),
  create: (dto: CreateProductDto) => post<Product>('/products', dto),
}
```

Then wrap in hooks in `src/hooks/useProducts.ts`.

## Testing

Mock the service module in tests — do **not** mock `apiClient` or `axios` directly for page/hook tests:

```tsx
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', phone: '0901234567', name: 'Test', role: 'customer' },
    }),
    requestRegisterOtp: vi.fn().mockResolvedValue(undefined),
    verifyOtp: vi.fn().mockResolvedValue({ otpToken: 'test-token' }),
    // include only methods called by the component under test
  },
}))
```

For testing the interceptor behaviour itself (e.g., `axios.test.ts`), use `axios-mock-adapter` directly on `apiClient`:

```ts
import MockAdapter from 'axios-mock-adapter'
import { apiClient } from './axios'

const mockApi = new MockAdapter(apiClient)
mockApi.onPost('/auth/login').reply(401, { code: 'INVALID_CREDENTIALS', message: '...' })
```
