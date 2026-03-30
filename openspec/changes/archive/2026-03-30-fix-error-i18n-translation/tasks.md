## 1. Fix resolveApiError

- [x] 1.1 In `src/utils/apiError.ts`, change `t(\`errors.${err.code}\`, { defaultValue: err.message })` to `t(err.code as string, { defaultValue: err.message })`
- [x] 1.2 In `src/utils/apiError.ts`, change `t('errors.unknown')` to `t('unknown')` (both occurrences)

## 2. Update apiError unit tests

- [x] 2.1 In `apiError.test.ts`: update `toHaveBeenCalledWith('errors.INVALID_CREDENTIALS', ...)` to `toHaveBeenCalledWith('INVALID_CREDENTIALS', ...)`
- [x] 2.2 In `apiError.test.ts`: update `toBe('errors.INVALID_CREDENTIALS')` to `toBe('INVALID_CREDENTIALS')`
- [x] 2.3 In `apiError.test.ts`: update both `toHaveBeenCalledWith('errors.unknown')` assertions to `toHaveBeenCalledWith('unknown')`
- [x] 2.4 In `apiError.test.ts`: update `toBe('errors.unknown')` to `toBe('unknown')`
- [x] 2.5 Run `npm run test -- src/utils/apiError.test.ts` and confirm all tests pass

## 3. Update page tests

- [x] 3.1 In `RegisterComplete.test.tsx`: update `getByText('errors.PHONE_ALREADY_EXISTS')` to `getByText('PHONE_ALREADY_EXISTS')`
- [x] 3.2 In `RegisterComplete.integration.test.tsx`: update `getByText('errors.PHONE_ALREADY_EXISTS')` to `getByText('PHONE_ALREADY_EXISTS')`
- [x] 3.3 Run `npm run test` and confirm all 185 tests pass

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` from `miniapp/` and confirm zero errors
- [x] 4.2 Run `npm run test:integration` from `miniapp/` and confirm all integration tests pass

## 5. Additional fixes (discovered during apply)

- [x] 5.1 In `Login.integration.test.tsx`: update `toHaveTextContent('errors.INVALID_CREDENTIALS')` to `toHaveTextContent('INVALID_CREDENTIALS')`
