## Why

The app currently detects language from the browser (`navigator.language`) and initializes theme to `'system'` (OS `prefers-color-scheme`). Inside the Zalo container, this means the app may start with the wrong language or theme — Zalo's own language and theme settings are independent of the OS and not surfaced by browser APIs. On first install, users see a mismatch between Zalo's UI and the mini app before they manually correct it.

## What Changes

- **New `src/zaloBootstrap.ts`** — synchronous side-effect module that calls `getSystemInfo()` from `zmp-sdk` inside an `isZalo` guard. Seeds `localStorage['i18nextLng']` from `zaloLanguage` and `localStorage['theme-preference']` from `zaloTheme`, **only when those keys are not already set** (user's explicit previous choice is always preserved).
- **`src/app.tsx`** — import `@/zaloBootstrap` as the very first import, before `@/i18n`, so the seed runs before i18next detector and Zustand persist middleware read `localStorage`.
- No changes to `i18n.ts`, `useThemeStore`, or any component — the existing detection and persist logic reads the pre-seeded values naturally.

## Capabilities

### New Capabilities

- `zalo-platform-bootstrap`: On first cold start inside the Zalo container, the app seeds language and theme from Zalo system info before i18n and theme store initialize, so the app opens matching the user's Zalo environment without any manual switching.

### Modified Capabilities

- `language-detection`: Detection priority changes — Zalo language now seeds `localStorage` before the i18next detector runs, effectively making Zalo the first-priority source on first visit (before the user has an explicit preference stored).
- `theme-preference`: Default theme on first visit changes from unconditional `'system'` to Zalo's reported theme when inside the Zalo container, with `'system'` as fallback for unknown values.

## Impact

- `miniapp/src/zaloBootstrap.ts` — new file (pure side-effect, ~30 lines)
- `miniapp/src/app.tsx` — one new import line at the top
- `miniapp/src/locales/` — no changes
- `miniapp/src/i18n.ts` — no changes
- `miniapp/src/store/useThemeStore.ts` — no changes
- No backend changes. No new npm dependencies (`zmp-sdk` is already installed).
