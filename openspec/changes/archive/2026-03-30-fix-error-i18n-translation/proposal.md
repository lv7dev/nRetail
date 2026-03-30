## Why

Backend error codes (e.g. `PHONE_ALREADY_EXISTS`) are silently shown in English even when the app is in Vietnamese, because `resolveApiError` builds the lookup key as `'errors.PHONE_ALREADY_EXISTS'` — a dotted path that i18next interprets as a nested JSON traversal inside the `errors` namespace, which fails against the flat `errors.json` structure.

## What Changes

- Fix `resolveApiError` in `src/utils/apiError.ts` to call `t(err.code)` and `t('unknown')` instead of the dot-prefixed `t('errors.${err.code}')` and `t('errors.unknown')` — matching the flat key structure in `errors.json`
- Update `apiError.test.ts` assertions to match the corrected key format (`'PHONE_ALREADY_EXISTS'` instead of `'errors.PHONE_ALREADY_EXISTS'`, `'unknown'` instead of `'errors.unknown'`)
- Update `RegisterComplete.test.tsx` and `RegisterComplete.integration.test.tsx` assertions from `'errors.PHONE_ALREADY_EXISTS'` → `'PHONE_ALREADY_EXISTS'`
- Update `CLAUDE.md` documentation in `src/utils/` to reflect the corrected contract

## Capabilities

### New Capabilities

<!-- None — this is a pure bug fix -->

### Modified Capabilities

- `api-error-handling`: The contract of `resolveApiError` changes — callers must pass `useTranslation('errors')` and the function now calls `t(err.code)` directly (no namespace prefix in the key)

## Impact

- `miniapp/src/utils/apiError.ts` — 2-line fix
- `miniapp/src/utils/apiError.test.ts` — 5 assertion updates
- `miniapp/src/pages/auth/register/RegisterComplete.test.tsx` — 1 assertion update
- `miniapp/src/pages/auth/register/RegisterComplete.integration.test.tsx` — 1 assertion update
- All 6 auth pages currently affected at runtime: register, otp, register/complete, login, forgot-password, new-password
- No backend changes, no locale file changes, no new dependencies
