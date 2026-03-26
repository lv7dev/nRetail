## 1. Helper: extractConstraintParams

- [x] 1.1 Write failing tests in `src/shared/pipes/__tests__/extract-constraint-params.spec.ts` covering: `minLength`, `maxLength`, `min`, `max`, `length`, `arrayMinSize`, `arrayMaxSize`, `matches`, `isIn`, and an unknown constraint (returns `undefined`)
- [x] 1.2 Create `src/shared/pipes/extract-constraint-params.ts` — pure function that looks up class-validator metadata via `getMetadataStorage()` and maps constraint arguments to a named params object
- [x] 1.3 Verify all helper tests pass (GREEN)

## 2. Wire params into exceptionFactory

- [x] 2.1 Update the failing test in `src/shared/pipes/__tests__/validation.pipe.spec.ts` to assert `params: { min: 6 }` appears on the `minLength` error item
- [x] 2.2 Update `exceptionFactory` in `src/shared/pipes/validation.pipe.ts` to call `extractConstraintParams` for each error item and include `params` in the output when defined
- [x] 2.3 Verify all pipe tests pass (GREEN)

## 3. Update e2e test

- [x] 3.1 Update `test/auth.e2e-spec.ts` validation error test to assert `params: { min: 6 }` on the password `minLength` error item
- [x] 3.2 Update `ErrorBody` type in `test/auth.e2e-spec.ts` to include `params?` on error items

## 4. Verify & Update Docs

- [x] 4.1 Run `npm run test` in `backend/` — all unit tests pass
- [x] 4.2 Run `npm run test:e2e` in `backend/` — all auth e2e tests pass
- [x] 4.3 Update `backend/CLAUDE.md` validation error shape example to include `params: { min: 6 }`
