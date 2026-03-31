## Context

`i18n.ts` runs as a side-effect module at import time — `i18n.init()` is called synchronously when `app.tsx` first imports `@/i18n`. The i18next `LanguageDetector` reads `localStorage['i18nextLng']` during that `init()` call. If the key is absent, it falls back to `navigator.language`.

`useThemeStore` uses Zustand's `persist` middleware, which rehydrates from `localStorage['theme-preference']` lazily — on the first call to `useThemeStore(...)` inside a component, which happens at component render time (well after all module imports have run).

`getSystemInfo()` from `zmp-sdk` is **synchronous** and returns `{ language, zaloLanguage, zaloTheme, ... }` immediately. It only works inside the Zalo WebView; outside (browser dev, tests) it would throw or return garbage.

The existing `storage.ts` already establishes the pattern: check `window.APP_ID` as the `isZalo` flag — it is set by the Zalo container before the mini app boots and is `undefined` in all other environments.

## Goals / Non-Goals

**Goals:**
- On first cold start inside Zalo, language and theme match the user's Zalo settings
- User's explicit previous choices (stored in `localStorage`) are always preserved — bootstrap only fills empty slots
- `i18n.ts`, `useThemeStore`, and all components are unchanged — they read seeded values naturally
- Safe no-op outside the Zalo container (browser dev, tests)

**Non-Goals:**
- Live-updating language/theme when the user changes Zalo settings while the mini app is open (no such event exists in the SDK)
- Using `language` (device OS language) from `SystemInfo` — `zaloLanguage` is more appropriate as it reflects the Zalo app's own language setting
- Changing the user's stored preference after it's been set — bootstrap is init-only

## Decisions

### Decision 1: Side-effect import before `@/i18n` in `app.tsx`, not inline in `i18n.ts`

**Chosen:** `src/zaloBootstrap.ts` imported as the first line of `app.tsx`:
```ts
import '@/zaloBootstrap'  // seeds localStorage
import '@/i18n'           // reads seeded values
```

**Alternatives considered:**
- Call `initZaloDefaults()` inside `i18n.ts` before `i18n.init()` — works but couples Zalo platform logic to i18n setup, making `i18n.ts` harder to test in isolation.
- A `bootstrap.ts` entry module that wraps both — adds an extra indirection layer with no benefit for this small scope.

**Rationale:** `zaloBootstrap.ts` at `src/` root signals "startup side-effect, order matters" by its location alongside `i18n.ts`. The import order in `app.tsx` is the explicit dependency declaration. ES modules guarantee depth-first execution — `zaloBootstrap` fully completes before `i18n.ts` starts.

### Decision 2: Only seed when `localStorage` key is absent

**Chosen:** Check `localStorage.getItem('i18nextLng')` and `localStorage.getItem('theme-preference')` — write only when `null`.

**Rationale:** Preserves user's explicit choices across sessions. If a user switched to English via `LanguageSwitcher`, that preference is in `localStorage` and must not be overwritten on every cold start. Bootstrap is a "first visit default", not a "Zalo always wins" override.

### Decision 3: `zaloTheme` unknown values map to `'system'`

**Chosen:**
```ts
const KNOWN_THEMES = new Set(['light', 'dark']);
const theme = KNOWN_THEMES.has(zaloTheme) ? zaloTheme : 'system';
```

**Rationale:** `zaloTheme` type is `string` — the SDK docs only mention `'light'` and `'dark'` but make no explicit guarantee. Defaulting unknown values to `'system'` means ThemeProvider falls back to `prefers-color-scheme`, which is a safe and functional state.

### Decision 4: `zaloLanguage` normalization — strip region tag

**Chosen:** `zaloLanguage.split('-')[0]` before writing to `localStorage`.

**Rationale:** Consistent with the existing `convertDetectedLanguage` in `i18n.ts`. The app only has `'vi'` and `'en'` resources; region tags are irrelevant. If `zaloLanguage` returns `'vi-VN'`, writing `'vi'` is correct. If the value is not in the supported set (`['vi', 'en']`), write nothing — let i18next fall back to its own detection and `fallbackLng: 'vi'`.

### Decision 5: `isZalo` guard — reuse `window.APP_ID` check

**Chosen:** Same pattern as `storage.ts` — check `typeof window !== 'undefined' && !!window.APP_ID`.

**Rationale:** Avoids importing `zmp-sdk` at all outside Zalo (lazy import inside the guard). Consistent with existing platform detection pattern.

## Risks / Trade-offs

- **Risk: `getSystemInfo()` throws outside Zalo** → Mitigation: the entire function body is wrapped in the `isZalo` guard; no SDK calls reach non-Zalo environments.
- **Risk: Import order accidentally swapped** (someone moves `import '@/zaloBootstrap'` below `import '@/i18n'`) → Mitigation: add a comment to both lines explaining the dependency. The bug would be immediately visible as a wrong initial language on first visit in Zalo.
- **Risk: `zaloTheme` returns a value we haven't mapped yet** (e.g., `'classic'`) → Mitigation: Decision 3's whitelist approach — falls back to `'system'` safely.
- **Trade-off: No live theme/language sync** — if the user changes Zalo theme during a session, the mini app won't update until next cold start. Accepted: no SDK event exists for this, and the ThemeSwitcher gives users manual control in the meantime.

## Open Questions

- What does `zaloTheme` actually return on a real device? User will test after implementation and report back. If values beyond `'light'`/`'dark'` are discovered, the whitelist in Decision 3 can be extended.
