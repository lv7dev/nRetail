## 1. Bootstrap Module

- [x] 1.1 Create `src/zaloBootstrap.ts` — `isZalo` guard (`window.APP_ID`), lazy import of `getSystemInfo` from `zmp-sdk`, seed `localStorage['i18nextLng']` if absent (normalize with `.split('-')[0]`, only write if value is `'vi'` or `'en'`)
- [x] 1.2 Seed `localStorage['theme-preference']` in same function — map `zaloTheme` to `'light'|'dark'|'system'` (unknown → `'system'`), write Zustand persist JSON format only if key absent

## 2. Wire into app.tsx

- [x] 2.1 Add `import '@/zaloBootstrap'` as the first import in `app.tsx`, before `import '@/i18n'` — add comment explaining the required order

## 3. Tests — Bootstrap module

- [x] 3.1 Write test: no-op when `window.APP_ID` is undefined (nothing written to localStorage)
- [x] 3.2 Write test: seeds `i18nextLng` from `zaloLanguage` when localStorage key absent
- [x] 3.3 Write test: seeds `i18nextLng` = `'vi'` when `zaloLanguage` is `'vi-VN'` (normalizes region tag)
- [x] 3.4 Write test: does NOT seed `i18nextLng` when `zaloLanguage` is unsupported (e.g. `'ja'`)
- [x] 3.5 Write test: does NOT overwrite existing `i18nextLng` in localStorage
- [x] 3.6 Write test: seeds `theme-preference` from `zaloTheme` (`'dark'` → Zustand persist JSON) when key absent
- [x] 3.7 Write test: seeds `theme-preference` = `'system'` when `zaloTheme` is unknown value
- [x] 3.8 Write test: does NOT overwrite existing `theme-preference` in localStorage

## 4. Tests — Updated specs

- [x] 4.1 Update `language-detection` tests: add scenario for Zalo bootstrap pre-seeding (Zalo language wins over navigator on first visit)
- [x] 4.2 Update `theme-preference` tests: add scenario for Zalo-sourced default on first visit inside Zalo
