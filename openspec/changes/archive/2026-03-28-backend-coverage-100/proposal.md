## Why

The backend test suite currently enforces `statements: 98, branches: 80, functions: 98, lines: 99` — a pragmatic starting point that leaves a 20% branch coverage gap. That gap hides real untested logic paths and is papered over by Istanbul phantom branches emitted from TypeScript decorator metadata compilation. Raising all metrics to 100% while correctly distinguishing phantom artifacts from real gaps eliminates this ambiguity and ensures every reachable code path is explicitly exercised or explicitly excluded.

## What Changes

- **ts-jest transform config**: add `"tsconfig": { "removeComments": false }` override so `/* istanbul ignore next */` comments survive TypeScript compilation (main tsconfig has `removeComments: true`).
- **`/* istanbul ignore next */` annotations**: add to ~12 constructors/class property declarations that emit phantom `__metadata` branches unreachable by design.
- **New unit tests for real logic gaps**: add 5–6 targeted test cases covering previously uncovered branches in `http-exception.filter`, `validation.pipe`, `extract-constraint-params`, and `auth.service.compareOtp`.
- **Coverage threshold raised to 100%**: all four metrics (`statements`, `branches`, `functions`, `lines`) set to `100` in `package.json`.
- **CLAUDE.md updated**: document the Istanbul phantom-branch pattern and the `removeComments` requirement so future contributors don't re-encounter it.

## Capabilities

### New Capabilities

- `backend-coverage-enforcement`: 100% coverage gate with explicit Istanbul ignore strategy for phantom TypeScript decorator branches.

### Modified Capabilities

- None — this is a pure test infrastructure and coverage configuration change; no production API behavior changes.

## Impact

- `backend/package.json` — Jest config (`coverageThreshold`, ts-jest transform `tsconfig`)
- `backend/src/shared/filters/http-exception.filter.ts` — add `/* istanbul ignore next */` on constructor phantom + 2 new test cases
- `backend/src/shared/pipes/validation.pipe.ts` — add `/* istanbul ignore next */` on constructor phantom + 1 new test case
- `backend/src/shared/utils/extract-constraint-params.ts` — 2 new test cases
- `backend/src/modules/auth/auth.service.ts` — 1 new test for `compareOtp` (real bcrypt, no mock)
- Multiple constructors across DTOs, services, repositories, guards, interceptors — `/* istanbul ignore next */` annotations
- `backend/CLAUDE.md` — document Istanbul ignore strategy and ts-jest `removeComments` rule
