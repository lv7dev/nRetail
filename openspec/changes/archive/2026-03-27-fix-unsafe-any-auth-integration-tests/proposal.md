## Why

`auth.integration.spec.ts` produces 54 ESLint errors (`@typescript-eslint/no-unsafe-assignment`, `no-unsafe-member-access`) because `supertest`'s `res.body` is typed as `any`, making every downstream access unsafe. The types that describe the actual response shapes already exist in `src/` — they just aren't being used in tests.

## What Changes

- Add two typed helper functions to `test/helpers/app.ts` (or a new `test/helpers/response.ts`):
  - `parseData<T>(res): T` — casts `res.body` as `ResponseShape<T>` and returns `.data`
  - `parseError(res): ErrorResponse` — casts `res.body` as `ErrorResponse`
- Rewrite all `res.body.*` accesses in `auth.integration.spec.ts` to use these helpers
- The unsafe `as` cast is isolated to the helper file — all test assertions become fully typed

## Capabilities

### New Capabilities

- `integration-test-response-helpers`: Typed helper utilities for parsing supertest HTTP responses in integration tests

### Modified Capabilities

<!-- none — no spec-level behavior changes -->

## Impact

- `backend/test/helpers/` — new or updated file with response helpers
- `backend/test/auth/auth.integration.spec.ts` — all `res.body` accesses replaced with typed helpers
- `backend/eslint.config.mjs` — no changes needed; errors resolved by proper typing
- No runtime behavior changes — test-only
