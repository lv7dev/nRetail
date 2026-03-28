## Why

The backend already enforces 100% test coverage (statements, branches, functions, lines) as a hard CI gate. The frontend has no coverage thresholds, currently sits at ~75% statements / ~72% branches / ~63% functions, and has entire components and pages with zero tests. Closing this gap brings the same quality guarantee to the miniapp that already exists in the NestJS backend.

## What Changes

- Add v8 coverage configuration and 100% thresholds to `vite.config.mts` (unit tests only — mirrors BE architecture where integration tests are separate and do not contribute to the threshold)
- Add `test:coverage` npm script that enforces thresholds on every run
- Add `/* v8 ignore */` markers for two intentionally unreachable branches: the `isZalo` nativeStorage path in `storage.ts` (requires live Zalo container) and the `DEV` console.warn in `axios.ts` (never true in production or tests)
- Exclude `authService.ts` from unit coverage — it is thin wrappers over `post`/`get` already fully exercised by MSW integration tests
- Write unit tests for all source files that currently have 0% or partial coverage: `AuthProvider`, `ProtectedRoute`, `AppLayout`, `AuthLayout`, `BottomNav`, `SplashPage`, stub pages (`home`, `cart`, `products`, `orders`, `profile`), `useAuthStore`, `useCartStore`, `apiError`, `storage`, `useAuth` hooks, `axios` interceptors
- Write unit tests to fill gaps in existing partial-coverage files: `Icon`, `OtpInput`, `PasswordInput`, `LanguageSwitcher`, `Login` page branches, `Register` schema
- Write unit tests for the missing `register/complete` page (currently 0%)
- Add integration tests for `AuthProvider` (MSW-backed rehydration flows) and `register/complete` page
- Add E2E specs for the missing register-complete flow, logout flow, and OTP error states

## Capabilities

### New Capabilities

- `frontend-unit-coverage`: Unit test coverage configuration, thresholds, exclusion rules, and the full set of unit tests achieving 100% across all metrics
- `frontend-integration-coverage`: Integration test gaps — AuthProvider and register/complete MSW-backed tests
- `frontend-e2e-coverage`: E2E test gaps — register/complete flow, logout, OTP error states

### Modified Capabilities

- `frontend-integration-testing`: Adds AuthProvider and register/complete integration test files to the existing MSW test suite

## Impact

- `miniapp/vite.config.mts` — coverage config added
- `miniapp/vitest.integration.config.ts` — no thresholds (integration tests remain separate)
- `miniapp/package.json` — new `test:coverage` script
- `miniapp/src/services/axios.ts` — two `/* v8 ignore */` markers
- `miniapp/src/utils/storage.ts` — one `/* v8 ignore */` marker
- `miniapp/src/services/authService.ts` — added to coverage exclude list (no test changes)
- New `*.test.tsx` files co-located with every currently untested source file
- New `*.integration.test.tsx` for `AuthProvider` and `register/complete`
- New `e2e/auth/register-complete.spec.ts`, `e2e/auth/logout.spec.ts`, `e2e/auth/otp-errors.spec.ts`
- No production code changes — tests and config only
