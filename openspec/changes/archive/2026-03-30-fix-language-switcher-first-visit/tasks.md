## 1. Test — LanguageSwitcher active state with region-tagged locale

- [x] 1.1 Add a test in `LanguageSwitcher.test.tsx` that mocks `i18n.language` as `vi-VN` and asserts the "Tiếng Việt" button has the active classes (`text-primary font-medium`) — this test must fail before the fix

## 2. Fix — Normalize detected language in i18n config

- [x] 2.1 Add `convertDetectedLanguage: (lng) => lng.split('-')[0]` to the `detection` options object in `miniapp/src/i18n.ts`

## 3. Verify

- [x] 3.1 Confirm the test from 1.1 now passes (`npm run test -- LanguageSwitcher`)
- [x] 3.2 Run the full unit test suite and confirm no regressions (`cd miniapp && npm run test`)
