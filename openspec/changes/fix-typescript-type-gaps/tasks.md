## 1. Window type declaration

- [x] 1.1 Create `miniapp/src/global.d.ts` with `declare global { interface Window { APP_CONFIG?: unknown } }`
- [x] 1.2 Verify `tsc --noEmit` no longer emits `Property 'APP_CONFIG' does not exist` for `src/app.tsx`

## 2. PasswordInput mock type fix

- [x] 2.1 In `RegisterComplete.test.tsx`, change the `forwardRef` second generic from `{ label?: string; error?: string; [k: string]: unknown }` to `{ label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>`
- [x] 2.2 Verify `tsc --noEmit` no longer emits the `unknown` assignability error for the mock
- [x] 2.3 Run `npm run test` in `miniapp/` to confirm all unit tests still pass

## 3. Playwright config tsconfig coverage

- [x] 3.1 Add `"../playwright.config.ts"` to the `include` array in `miniapp/e2e/tsconfig.json`
- [x] 3.2 Verify `tsc --noEmit` (using the e2e tsconfig) no longer emits `Cannot find name 'process'`

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` from `miniapp/` and confirm zero errors
- [x] 4.2 Run `npm run test` from `miniapp/` and confirm all tests pass
