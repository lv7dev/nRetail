## Context

The miniapp runs inside the Zalo WebView at base path `/zapps/{APP_ID}/`. Two bugs compound to break authenticated API calls in production:

1. `handleAuthFailure()` in `axios.ts` calls `window.location.replace('/login')`. The absolute path ignores the Zalo base, navigating to the wrong URL and failing silently — leaving the user stranded instead of seeing the login screen.

2. The backend's `app.enableCors()` call uses no options, defaulting to `Access-Control-Allow-Origin: *`. Wildcard CORS does not allow requests that include credentials or custom headers. Because `Authorization` is not listed in `Access-Control-Allow-Headers`, the browser's CORS preflight (`OPTIONS`) for any authenticated request returns without the required header, causing the browser to block the actual request. Axios receives a network error with no `.response` — so `error.response?.status === 401` is false and the token refresh logic is never entered.

## Goals / Non-Goals

**Goals:**
- `handleAuthFailure` redirects to the correct login URL inside the Zalo WebView and in browser dev
- Backend CORS explicitly allows `Authorization` header from configured origins
- CORS origins are env-var driven (not hardcoded) so production and dev can differ without code changes
- Startup fails fast if `CORS_ORIGINS` is missing (consistent with existing Zod validation pattern)

**Non-Goals:**
- Supporting additional Zalo WebView origins beyond `https://h5.zdn.vn` (can be added to env var as needed)
- Supporting cookie-based credentials (Bearer token only; `credentials: true` not required)
- Changing the token refresh or auth flow logic

## Decisions

### Decision: Zalo-aware base path via `window.APP_ID`

`handleAuthFailure` uses the same `window.APP_ID` guard already established in `zaloBootstrap.ts` and `storage.ts`:

```
const base = window.APP_ID ? `/zapps/${window.APP_ID}` : '';
window.location.replace(`${base}/login`);
```

**Alternative considered:** React Router `navigate('/login')` via an injected callback. Rejected — `axios.ts` is framework-agnostic infrastructure and should not depend on React Router. The hard-redirect pattern (`window.location.replace`) is correct here since an auth failure requires a full page reset.

**Alternative considered:** A module-level constant for the base path. Rejected — `window.APP_ID` is set by the Zalo container before app boot; reading it at call time is safe and consistent with how `storage.ts` reads `isZalo`.

### Decision: `CORS_ORIGINS` as a required env var (comma-separated string)

```
CORS_ORIGINS=https://h5.zdn.vn,http://localhost:3000
```

Parsed at startup: `process.env.CORS_ORIGINS.split(',').map(s => s.trim())`.

**Alternative considered:** `NODE_ENV`-based conditional (`if dev, add localhost`). Rejected — couples CORS policy to deployment env names, makes it harder to add origins without code changes.

**Alternative considered:** Hardcoded array. Rejected — production origins may change (Zalo could add new WebView hosts) and hardcoding requires a redeploy.

**Why required (not optional with default)?** A missing `CORS_ORIGINS` in production would silently break all authenticated API calls. Failing at startup is safer.

### Decision: Explicit `allowedHeaders` and `methods` in `enableCors`

```ts
app.enableCors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

`Authorization` must be in `allowedHeaders` for preflight to pass on authenticated requests. `OPTIONS` must be in `methods` so the preflight itself is not rejected. `credentials: true` is omitted — the app uses Bearer tokens, not cookies.

## Risks / Trade-offs

- **[Risk] CORS_ORIGINS missing in production deploy** → Mitigation: Zod schema marks it required; app refuses to start if absent. Document in `.env.example`.
- **[Risk] Zalo adds additional WebView origins** → Mitigation: Env-var approach means adding an origin requires only a config change + redeploy, no code change.
- **[Risk] `handleAuthFailure` `v8 ignore` coverage** → The `window.location.replace` line is already under `/* v8 ignore */` treatment; the new `window.APP_ID` branch follows the same pattern as `storage.ts`.

## Migration Plan

1. Deploy backend with `CORS_ORIGINS=https://h5.zdn.vn` set in Render env
2. Deploy miniapp with the `handleAuthFailure` fix
3. No data migration required — purely config and runtime behavior
4. **Rollback**: Revert to `app.enableCors()` and `window.location.replace('/login')` — no state is touched
