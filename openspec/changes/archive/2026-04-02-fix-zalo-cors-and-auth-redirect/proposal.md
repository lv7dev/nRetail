## Why

Two production bugs block authenticated API calls in the Zalo Mini App WebView: the backend's wildcard CORS config omits `Authorization` from allowed headers (causing all authenticated preflight requests to fail silently), and the frontend's `handleAuthFailure` redirects to `/login` using a hardcoded absolute path that ignores the Zalo base path (`/zapps/{APP_ID}/`), leaving users stranded on an invalid URL after token expiry.

## What Changes

- `miniapp/src/services/axios.ts` — `handleAuthFailure` prepends the Zalo base path when `window.APP_ID` is set, using the same pattern as `BrowserRouter basename` in `app.tsx`
- `backend/src/main.ts` — `app.enableCors()` replaced with explicit options: allowed origins from env, `Authorization` in `allowedHeaders`, explicit methods list
- `backend/src/config/config.schema.ts` — new `CORS_ORIGINS` env var (comma-separated string, parsed to `string[]` at startup)
- `backend/.env` + `backend/.env.example` — document `CORS_ORIGINS` for dev (`https://h5.zdn.vn,http://localhost:3000`) and production (`https://h5.zdn.vn`)

## Capabilities

### New Capabilities
- `cors-configuration`: Restrict allowed CORS origins to an explicit env-var-driven allowlist, with `Authorization` header support for authenticated cross-origin requests from the Zalo WebView and localhost dev

### Modified Capabilities
- `axios-client`: `handleAuthFailure` redirect is now Zalo-aware — uses `/zapps/${window.APP_ID}/login` when running inside the Zalo container, falls back to `/login` in browser/test environments
- `config`: New `CORS_ORIGINS` env var added to the typed Zod config schema

## Impact

- **Backend**: `main.ts`, `config/config.schema.ts`, `.env`, `.env.example`
- **Miniapp**: `src/services/axios.ts`
- **Deploy**: `CORS_ORIGINS` must be set in production env (Render) — missing var will cause startup failure (Zod validation enforces this)
- **No API contract changes** — purely infrastructure/config
