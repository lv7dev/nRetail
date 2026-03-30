# Utils

Pure helper functions with no side effects (except `storage.ts` which wraps platform APIs). No React, no hooks, no imports from `@/components` or `@/pages`.

## Files

| File          | Purpose                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `apiError.ts` | `ApiError` class + `resolveApiError()` for i18n-aware error messages           |
| `storage.ts`  | Token storage wrapper: `nativeStorage` (Zalo) or `localStorage` (browser/test) |
| `cn.ts`       | Tailwind class merging utility via `clsx` + `tailwind-merge`                   |

---

## apiError.ts

### `ApiError`

A typed error class thrown by the axios response interceptor. Carries `status`, `message`, and optional `code`.

```ts
class ApiError extends Error {
  status: number; // HTTP status code (0 = network error)
  code?: string; // machine-readable key matching errors.json (e.g. 'INVALID_CREDENTIALS')
}
```

### `resolveApiError(err, t)`

Converts any thrown value into a user-facing translated string. Call it in mutation `onError` handlers:

```ts
import { resolveApiError } from '@/utils/apiError';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('errors');

mutate(data, {
  onError: (err) => setError(resolveApiError(err, t)),
});
```

**Resolution order:**

1. `ApiError` with `code` → `t(err.code, { defaultValue: err.message })` → looks up flat key in `locales/{vi,en}/errors.json`
2. `ApiError` without `code` → `err.message` (raw server message)
3. Anything else → `t('unknown')`

**Important:** Always pass `useTranslation('errors')` — the function calls `t(err.code)` directly against the `errors` namespace. With the mock `t = k => k`, `resolveApiError` returns `'PHONE_ALREADY_EXISTS'` (not `'errors.PHONE_ALREADY_EXISTS'`).

---

## storage.ts

Token storage abstraction. Uses `nativeStorage` from `zmp-sdk` when running inside the Zalo container, falls back to `localStorage` in browser dev and all test environments.

```ts
import { storage } from '@/utils/storage';

storage.getAccessToken(); // → string | null
storage.getRefreshToken(); // → string | null
storage.setTokens(access, refresh); // persist both tokens
storage.clearTokens(); // remove both tokens
```

**Platform detection** — `isZalo` is checked once at module load time via `window.APP_ID`. The Zalo container sets this before the mini app boots; it is `undefined` in a browser tab or test runner.

**Rules:**

- Never read or write tokens directly (`localStorage.getItem('accessToken')`) — always use `storage.*`
- `clearTokens()` is called by `useAuthStore.clearAuth()` — do not call it elsewhere
- Do NOT set `window.APP_ID` in tests — it routes all calls to `nativeStorage`, which throws outside Zalo
- The `isZalo` branch and the `store` object are wrapped in `/* v8 ignore start/stop */` because the Zalo path is never exercised in jsdom tests

---

## cn.ts

Combines Tailwind classes safely using `clsx` (conditional logic) and `tailwind-merge` (deduplication).

```ts
import { cn } from '@/utils/cn'

// Conditional classes
<div className={cn('base-class', isActive && 'active-class', className)} />

// Deduplication (tw-merge resolves conflicts like two bg-* classes)
cn('bg-red-500 text-white', 'bg-blue-500')  // → 'text-white bg-blue-500'
```

Always use `cn()` in components — never string concatenation. Every component accepts `className?: string` and passes it through `cn()`.
