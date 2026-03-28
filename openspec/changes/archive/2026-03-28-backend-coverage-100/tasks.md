## 1. Fix ts-jest removeComments Override

- [x] 1.1 In `backend/package.json`, add `"tsconfig": { "removeComments": false }` to the ts-jest transform entry under `jest.transform` so `/* istanbul ignore next */` annotations survive TypeScript compilation

## 2. Add Istanbul Ignore Annotations — Phantom Branches

- [x] 2.1 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/auth.controller.ts`
- [x] 2.2 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/auth.service.ts`
- [x] 2.3 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/jwt.strategy.ts`
- [x] 2.4 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/otp.repository.ts`
- [x] 2.5 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/phone-config.repository.ts`
- [x] 2.6 Add `/* istanbul ignore next */` before constructor in `src/modules/auth/refresh-token.repository.ts`
- [x] 2.7 Add `/* istanbul ignore next */` before constructor in `src/modules/health/health.controller.ts`
- [x] 2.8 Add `/* istanbul ignore next */` before constructor in `src/modules/health/health.service.ts`
- [x] 2.9 Add `/* istanbul ignore next */` before constructor in `src/modules/users/users.controller.ts`
- [x] 2.10 Add `/* istanbul ignore next */` before constructor in `src/modules/users/users.repository.ts`
- [x] 2.11 Add `/* istanbul ignore next */` before constructor in `src/modules/users/users.service.ts`
- [x] 2.12 Add `/* istanbul ignore next */` before constructor in `src/shared/database/prisma.service.ts`
- [x] 2.13 Add `/* istanbul ignore next */` before constructor in `src/shared/filters/http-exception.filter.ts` — N/A: no explicit constructor with typed params; no phantom branches
- [x] 2.14 Add `/* istanbul ignore next */` before constructor in `src/shared/guards/jwt-auth.guard.ts` — N/A: no explicit constructor
- [x] 2.15 Add `/* istanbul ignore next */` before constructor in `src/shared/guards/roles.guard.ts` — N/A: no explicit constructor
- [x] 2.16 Add `/* istanbul ignore next */` before constructor in `src/shared/interceptors/logging.interceptor.ts` — N/A: no explicit constructor
- [x] 2.17 Add `/* istanbul ignore next */` before constructor in `src/shared/interceptors/response.interceptor.ts` — N/A: no explicit constructor
- [x] 2.18 Add `/* istanbul ignore next */` before constructor in `src/shared/pipes/validation.pipe.ts` — N/A: not a class, is a function call
- [x] 2.19 Check all DTO classes in `src/modules/auth/dto/` and `src/modules/users/dto/` for phantom branches — DTOs use primitive typed properties (string/number/boolean), no typeof phantom branches expected; verify in coverage run

## 3. Unit Tests — Real Logic Gaps

- [x] 3.1 In `src/shared/filters/__tests__/http-exception.filter.spec.ts`, add test: `new HttpException('plain string message', 400)` — verify filter returns status 400 and `message: 'plain string message'`
- [x] 3.2 In `src/shared/filters/__tests__/http-exception.filter.spec.ts`, add test: `new HttpException({ code: 'FOO' }, 400)` (object with no `message` field) — verify filter falls back to `exception.message`
- [x] 3.3 In `src/shared/pipes/__tests__/validation.pipe.spec.ts`, add test: ValidationError with `constraints: undefined` — verify error message defaults to `'unknown'`
- [x] 3.4 In `src/shared/pipes/__tests__/extract-constraint-params.spec.ts` (create if not exists), add test: called with a ValidationError that has no `target` — verify returns without throwing
- [x] 3.5 In `src/shared/pipes/__tests__/extract-constraint-params.spec.ts`, add test: called with a constraint key that has no matching metadata entry — verify returns empty params object
- [x] 3.6 In `src/modules/auth/__tests__/auth.service.spec.ts`, add test for `compareOtp` private method: use real bcrypt hash (no spy), pass matching OTP, verify resolves `true`; add second case with wrong OTP, verify resolves `false`

## 4. Raise Coverage Threshold to 100%

- [x] 4.1 Run `npm run test:cov` with current state — document which metrics are still below 100% and which phantom files still show uncovered branches
- [x] 4.2 Iterate on annotations and tests until `npm run test:cov` passes with all four metrics at 100%
- [x] 4.3 In `backend/package.json` `jest.coverageThreshold`, set all four metrics to `100`: `{ "global": { "statements": 100, "branches": 100, "functions": 100, "lines": 100 } }`
- [x] 4.4 Run `npm run test:cov` one final time to confirm threshold passes

## 5. Lint and Documentation

- [x] 5.1 Run `npm run lint` and fix any ESLint/Prettier errors introduced by new tests or annotations
- [x] 5.2 Update `backend/CLAUDE.md` — add a "Coverage Enforcement" section documenting: the 100% threshold, the Istanbul phantom-branch problem, the `removeComments: false` fix, and the `/* istanbul ignore next */` rule for every new NestJS injectable class constructor
