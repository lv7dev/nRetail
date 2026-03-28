## Context

The backend enforces 100% test coverage via Jest's `coverageThreshold` config. The miniapp has no coverage gate — `@vitest/coverage-v8` was just added but no thresholds or config exist yet. Current state: ~75% statements, ~72% branches, ~63% functions. Two architectural constraints shape the design:

1. **Integration tests stay separate** — `npm run test:integration` uses a different Vitest config and does NOT contribute to the coverage threshold (mirrors the BE approach: `npm run test:cov` runs only unit tests).
2. **`authService.ts` is excluded from unit coverage** — it is thin HTTP wrappers whose behaviour is already fully exercised by MSW integration tests. Counting it in unit coverage would require either mocking the axios helpers (fragile) or duplicating integration test assertions.

Two platform-specific branches are intentionally unreachable in tests and require ignore markers rather than tests:
- `storage.ts`: `isZalo = !!(window as any).APP_ID` — the `true` branch calls `nativeStorage` which throws outside the Zalo container. CLAUDE.md explicitly forbids setting `window.APP_ID` in tests.
- `axios.ts` lines 6-8: `if (import.meta.env.DEV && !VITE_API_BASE_URL)` — `DEV` is always false in test and production environments. This is a development-only guard, not application logic.

## Goals / Non-Goals

**Goals:**
- 100% coverage on all 4 metrics (statements, branches, functions, lines) enforced by `npm run test:coverage`
- Every file with application logic has at least one unit test
- Integration tests cover `AuthProvider` rehydration and `register/complete` form submission end-to-end via MSW
- E2E specs cover the register-complete flow, logout, and OTP error states — currently missing entirely
- No production code changes — tests and config only

**Non-Goals:**
- Testing `authService.ts` at the unit level (covered by integration tests)
- Testing `app.tsx`, `i18n.ts`, barrel `index.ts` files, type files, setup files, or mock infrastructure
- Achieving integration test coverage metrics (integration tests are a separate tier, not measured)
- Porting the BE's custom `jest-transform.js` — the FE has no NestJS decorators so no phantom branch problem exists

## Decisions

### D1: v8 provider, source-level ignore markers

Using `@vitest/coverage-v8` (already installed). Ignore markers use `/* v8 ignore next N */` comment syntax (Vitest supports both `v8 ignore` and `istanbul ignore` with the v8 provider).

**Alternative considered:** Switch to `@vitest/coverage-istanbul`. Rejected — v8 is faster and already installed. The only motivation would be consistency with the BE's Istanbul provider, but FE has no decorator phantom branch problem so there's no practical difference.

### D2: Coverage measured from unit tests only — integration tests excluded

`npm run test:coverage` runs the same unit-test config as `npm run test`, just with `--coverage` added. The `vitest.integration.config.ts` has no thresholds.

**Alternative considered:** Merge coverage from both unit and integration runs. Rejected — it would let poorly-tested units hide behind integration tests and makes the enforcement logic more complex. Mirrors the BE exactly.

### D3: authService.ts excluded via coveragePathIgnorePatterns

`authService.ts` is excluded from coverage collection entirely (`exclude` array in `vite.config.mts`). No `/* v8 ignore */` markers needed inside the file itself.

**Alternative considered:** Unit tests for authService that mock `post`/`get`. Rejected — thin wrappers that just call `post('/endpoint', body)` have no branching logic worth unit-testing; the MSW integration tests already verify the full HTTP contract.

### D4: axios.ts interceptors ARE unit-tested

The response interceptor has significant branching logic (8 distinct paths: 401 vs non-401, authenticated vs unauthenticated, refresh token present vs missing, refresh success vs failure, already retried flag). This logic warrants direct unit tests where interceptor handler functions are extracted and called with mock configs/errors.

**Alternative considered:** Cover interceptors only via integration tests. Rejected — unit coverage run would show `axios.ts` at ~58%, blocking the 100% threshold.

### D5: Stub pages get render-only unit tests now

`home.tsx`, `cart.tsx`, `products.tsx`, `orders.tsx`, `profile.tsx` are stubs (`<h1>...</h1>` only). They get minimal render tests now. When real logic is added later, TDD kicks in naturally — the new logic fails coverage, forcing a test-first approach.

## Risks / Trade-offs

- **Axios interceptor unit tests are tricky** — the interceptors are registered as side effects when the module loads. Tests need to work with the same `apiClient` instance and simulate 401 responses without triggering real HTTP. Pattern: use `axios-mock-adapter` on `apiClient` for unit tests (different from integration tests which use MSW). Risk: low — this pattern is well-established.
- **v8 coverage branch sensitivity** — v8 tracks branches at bytecode level and can flag ternaries/optional chains that Istanbul would miss. Some files may reveal unexpected branch gaps once the threshold is enforced. Mitigation: run `npm run test:coverage` after each phase to catch surprises early.
- **Vitest module isolation for axios.ts** — `refreshPromise` is a module-level singleton. Tests that trigger the refresh path need to ensure this is reset between tests (`vi.resetModules()` or careful test ordering). Risk: medium — worth flagging in the tasks.

## Migration Plan

1. Start with infrastructure (Phase 0) — add coverage config but set thresholds to current levels first, then raise to 100% incrementally as tests are written
2. Each phase adds tests and raises the threshold for the newly covered files
3. Final state: thresholds at 100%, `npm run test:coverage` in CI

No rollback needed — this is additive (tests + config only).
