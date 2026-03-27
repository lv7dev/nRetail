## Why

`nativeStorage` from `zmp-sdk` throws at runtime when called outside the Zalo container (browser dev, tests). The current `storage.ts` has no fallback, so `AuthProvider` crashes on every dev server start with an unhandled React error.

## What Changes

- `utils/storage.ts` gains a platform detection check (`window.APP_ID`) and falls back to `localStorage` when not running in Zalo
- All four storage operations (`getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`) become safe to call in any environment

## Capabilities

### New Capabilities

- `token-storage`: Platform-aware token persistence — uses `nativeStorage` in Zalo, `localStorage` in browser dev/tests

### Modified Capabilities

- `auth-api-integration`: The storage utility now works in the browser dev environment, so the full auth flow (login, rehydration, refresh) works without the Zalo container

## Impact

- `miniapp/src/utils/storage.ts` — only file changed
- No API surface changes — `storage.*` callers are unchanged
- Fixes runtime crash in browser dev; no change to Zalo production behavior
