# Auth Pages

Auth pages live under `src/pages/auth/`. They use `AuthLayout` (centered layout with floating back button).

## Auth Flows

### Register (3 steps)

```
/register  →  /otp  →  /register/complete  →  / (home)
```

| Step | Page | What it does |
|------|------|--------------|
| 1 | `/register` | Collects phone. Calls `useRequestOtp('register')` → `POST /auth/otp/register`. On success navigates to `/otp` with state `{ flow: 'register', phone }`. |
| 2 | `/otp` | Collects 6-digit OTP. Calls `useVerifyOtp()` → `POST /auth/otp/verify`. On success navigates to `/register/complete` with state `{ phone, otpToken }`. Resend button calls `useRequestOtp('register')` again. |
| 3 | `/register/complete` | Collects name + password + confirmPassword. Guards on `otpToken` in router state (redirects to `/login` if missing). Calls `useRegister()` → `POST /auth/register`. On success `setAuth(user)` is called by the hook, router sends to `/`. |

### Forgot Password (3 steps)

```
/forgot-password  →  /otp  →  /new-password  →  /login
```

| Step | Page | What it does |
|------|------|--------------|
| 1 | `/forgot-password` | Collects phone. Calls `useRequestOtp('forgot')` → `POST /auth/otp/forgot-password`. On success navigates to `/otp` with state `{ flow: 'forgot', phone }`. |
| 2 | `/otp` | Same OTP page as register. On success navigates to `/new-password` with state `{ phone, otpToken }`. Resend button calls `useRequestOtp('forgot')`. |
| 3 | `/new-password` | Collects newPassword + confirmPassword. Guards on `otpToken` in router state. Calls `useResetPassword()` → `POST /auth/reset-password`. On success navigates to `/login`. |

### Login (1 step)

```
/login  →  / (home)
```

Calls `useLogin()` → `POST /auth/login`. On success `setAuth(user)` is called by the hook.

## Router State Chain

State is passed between pages via React Router's `useNavigate` `state` option:

```ts
// /register or /forgot-password → /otp
navigate('/otp', { state: { flow: 'register' | 'forgot', phone } })

// /otp → /register/complete (register flow)
navigate('/register/complete', { state: { phone, otpToken } })

// /otp → /new-password (forgot flow)
navigate('/new-password', { state: { phone, otpToken } })
```

**Read state at the destination:**
```ts
const location = useLocation()
const state = location.state as { phone: string; otpToken: string } | null

// Guard: if state is missing, the page was reached directly → redirect
if (!state?.otpToken) {
  navigate('/login', { replace: true })
  return null
}
```

## OTP Page Flow Awareness

`/otp` is shared by both flows. It reads `flow` from router state to determine:
- Which resend mutation to call (`useRequestOtp('register')` vs `useRequestOtp('forgot')`)
- Where to navigate after successful verification (`/register/complete` vs `/new-password`)

## Hooks Used

All API calls go through hooks in `src/hooks/useAuth.ts`. Pages never call `authService` directly.

| Hook | Used by |
|------|---------|
| `useLogin()` | `/login` |
| `useRequestOtp('register')` | `/register`, `/otp` (resend, register flow) |
| `useRequestOtp('forgot')` | `/forgot-password`, `/otp` (resend, forgot flow) |
| `useVerifyOtp()` | `/otp` |
| `useRegister()` | `/register/complete` |
| `useResetPassword()` | `/new-password` |

## Error Display

All pages display API errors via `resolveApiError`:

```tsx
import { resolveApiError } from '@/utils/apiError'
import { useTranslation } from 'react-i18next'

const { t } = useTranslation(['auth', 'errors'])
const { mutate, isPending } = useLogin()
const [apiError, setApiError] = useState('')

const onSubmit = (data) => {
  setApiError('')
  mutate(data, {
    onError: (err) => setApiError(resolveApiError(err, t)),
  })
}
```

Error codes are resolved via `locales/{vi,en}/errors.json`.

## Guards Summary

| Page | Guard condition | Redirect |
|------|----------------|----------|
| All auth pages | `user` already logged in | `/` |
| `/otp` | No router state | `/login` |
| `/register/complete` | No `otpToken` in state | `/login` |
| `/new-password` | No `otpToken` in state | `/login` |
