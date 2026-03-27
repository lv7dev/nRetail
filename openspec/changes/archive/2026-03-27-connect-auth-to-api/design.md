## Context

The miniapp has complete auth UI pages wired to `setTimeout` stubs. The backend auth API is fully operational. The existing `services/api.ts` uses raw `fetch` with no interceptor support and no error normalization. `useAuthStore` holds only `user` in memory with no token persistence. There is no service layer, no custom hooks, and no app-start rehydration — a logged-in user is bounced to `/login` on every page reload.

`nativeStorage` from `zmp-sdk` provides a synchronous key-value store (falls back to `localStorage` in dev, uses Zalo's native storage in production) — the right place for tokens.

## Goals / Non-Goals

**Goals:**
- Full auth flows connected to backend with proper error handling
- Axios instance as the single HTTP gateway with interceptors for token injection and silent refresh
- TanStack Query mutations as the async layer between pages and the service layer
- `nativeStorage` for token persistence across sessions
- Rehydration on app start: call `GET /auth/me` if token present, show `SplashPage` until ready
- `Button` loading state driven by mutation `isPending` — no manual `useState(loading)` in pages
- Centralized error display via `resolveApiError` + `errors.json` i18n catalog

**Non-Goals:**
- OAuth / social login
- Token encryption at rest
- Background token refresh (proactive; only reactive on 401)
- Refresh token rotation display to user
- Any backend changes

## Decisions

**Decision: Axios over native fetch**

`fetch` has no interceptor support, making auth header injection and 401 retry awkward to add globally. Axios's interceptor chain handles request decoration and response error normalization in one place. The existing `api.ts` surface (`get`, `post`, `put`, `del`) is preserved so future non-auth services can import from `axios.ts` without changes.

Alternative considered: `ky` (a fetch-based library with hooks). Rejected — the team already knows Axios and `zmp-sdk` examples use it.

**Decision: Silent refresh on 401**

When any request returns 401, the interceptor:
1. Checks `_retry` flag on the config to prevent infinite loops
2. Reads `refreshToken` from `nativeStorage`
3. Makes a direct Axios call (bypassing interceptors) to `POST /auth/refresh`
4. On success: stores new tokens, retries the original request
5. On failure: calls `clearAuth()` and redirects to `/login`

The refresh call uses a separate Axios instance (no interceptors) to avoid re-triggering the 401 handler on the refresh call itself.

Alternative: proactive refresh before expiry via a timer. Rejected — adds complexity and JWT expiry is not exposed to the client without decoding the token. Reactive is sufficient for current scale.

**Decision: `resolveApiError(err, t)` utility + `errors.json` i18n catalog**

The backend returns `{ statusCode, message, code }` on all business errors (e.g., `PHONE_ALREADY_EXISTS`, `OTP_INVALID`). Two alternatives were explored:

- Hooks translate: hooks call `t()` internally. Rejected — hooks need i18n as a dependency, and error logic is split across every hook.
- Pages translate inline: each page calls `t(`errors.${code}`)` directly. Rejected — duplicates the same pattern in every page.

Chosen: a single `resolveApiError(err: unknown, t: TFunction): string` utility. It extracts `code` from `ApiError`, returns `t(`errors.${code}`, { defaultValue: err.message })`. Pages import this one util and pass their `t` function. New backend error codes only require adding a key to `errors.json`.

**Decision: 3-step register flow with router state**

Backend requires `POST /auth/register { otpToken, name, password, confirmPassword }` — `otpToken` only exists after OTP verification. The prior UI had credentials collected before OTP, making it impossible to satisfy the backend contract.

New flow: `/register` (phone) → `/otp` → `/register/complete` (name + password).

Credentials travel through router state: `{ phone, otpToken }` passed from OTP page to `/register/complete`. No sensitive data (password) lives in router state — the user enters password fresh on the complete page. This avoids any concern about passwords in navigation history.

**Decision: `AuthProvider` wrapper for rehydration**

`AuthProvider` is a React component wrapping the route tree in `App.tsx`. On mount:
1. Reads `accessToken` from `nativeStorage`
2. If none: sets `isReady = true` immediately (router handles redirect to `/login`)
3. If present: calls `GET /auth/me` via a plain Axios request (not a TanStack Query `useQuery` — no caching needed for a one-time init call)
4. On success: `setAuth(user)`, `isReady = true`
5. On failure: `clearAuth()`, `isReady = true`

While `!isReady`, `AuthProvider` renders `<SplashPage />` in place of the route tree. This covers any future "config on login" calls (just add them to the `AuthProvider` init sequence).

`ProtectedRoute` gains an `isReady` check: if `!isReady` render nothing (splash is already shown by `AuthProvider`).

Alternative: `useQuery` for `GET /auth/me`. Rejected — `useQuery` is for data that can be refetched, cached, and invalidated. App init is a one-time imperative sequence better expressed as an `async/await` in `useEffect`.

**Decision: `Button` `loading` prop replaces manual `useState(loading)`**

Every form page currently has `const [loading, setLoading] = useState(false)` with manual set/clear around API calls. With TanStack Query, `mutation.isPending` is the authoritative loading signal. Pages pass `isPending` to `<Button loading={...}>` — no manual state needed. The `Button` renders an inline SVG spinner (Tailwind `animate-spin`) and sets `disabled` + `pointer-events-none` when loading. The spinner replaces nothing — it appears before the label text.

## Risks / Trade-offs

- [Router state as credential transport] `otpToken` travels via `location.state` to `/register/complete` and `/new-password`. If user refreshes mid-flow, state is lost and they're redirected back to `/login`. Mitigation: `Navigate to="/login"` guard is already in place on both pages.
- [nativeStorage async fallback] `nativeStorage` is documented as sync with a dev localStorage fallback. If Zalo ever makes it async, the interceptor's sync `getItem` call breaks silently. Mitigation: wrap storage access in a thin module (`utils/storage.ts`) so the call site is one place.
- [No token expiry awareness] The client doesn't decode JWT expiry — it only reacts to 401s. A request made 1 second after token expiry will fail once, refresh, then retry. Mitigation: acceptable; adds one extra round-trip at most.
- [Silent refresh race] Two concurrent requests could both hit 401 simultaneously, each trying to refresh. Mitigation: add a `refreshPromise` singleton in the interceptor — if refresh is already in flight, queue the second retry behind the same promise.

## Migration Plan

1. Install `axios` (`npm i axios` in `miniapp/`)
2. Build the layer bottom-up: types → storage util → axios instance → authService → useAuth hooks → store → AuthProvider → pages
3. Keep `services/api.ts` in place until all consumers are migrated; remove after
4. No backend changes, no database migrations, no feature flags needed
5. Rollback: revert `App.tsx` to remove `AuthProvider` and restore page stubs
