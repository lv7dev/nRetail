## Context

The miniapp is a Zalo Mini App built with React 18, TypeScript, Vite, and Tailwind CSS. `tailwind.config.js` already sets `darkMode: "class"`, meaning Tailwind's `dark:` utilities activate when `<html>` carries the class `dark`. However, the Zalo platform UI library (`zmp-ui`) uses a completely different mechanism — it reads `body[zaui-theme="dark"]` — so both must be kept in sync. No theme infrastructure (store, provider, or switcher) exists yet.

Zustand is the established pattern for client state (see `useAuthStore`). The `persist` middleware ships with Zustand and is already a transitive dependency — no new packages are needed.

## Goals / Non-Goals

**Goals:**

- Provide a `useThemeStore` that stores and persists the user's raw preference (`'light' | 'dark' | 'system'`).
- Provide a `ThemeProvider` that computes the resolved theme from the preference + OS signal, and synchronizes both `html.dark` (Tailwind) and `body[zaui-theme]` (zmp-ui) whenever the resolved theme changes.
- Provide a `ThemeSwitcher` dropdown component usable in all three placement sites (AuthLayout, AppLayout header, Profile page).
- Extend `tailwind.config.js` with dark-mode color tokens so that `dark:bg-surface-dark`, `dark:text-content-dark`, etc., are available for all future UI work.

**Non-Goals:**

- Applying `dark:` classes to existing components (that is future work per component).
- Server-side or SSR theme detection.
- Per-route theme overrides.
- Custom accent color selection.

## Decisions

### D1 — Three preference states: `'light' | 'dark' | 'system'`

`'system'` delegates to the OS `prefers-color-scheme` media query. This is the modern standard (macOS, Android, iOS all support it). Alternative: two-state toggle (light/dark only) — rejected because it ignores a common user expectation and requires manual re-selection when changing OS settings.

### D2 — `ThemeProvider` owns all DOM side effects; store owns no DOM knowledge

The store holds only the raw preference (serializable, testable in isolation). `ThemeProvider` is a React component that reads the store, computes `resolved`, and executes DOM mutations in a `useEffect`. This keeps the store pure and makes DOM sync easy to test by rendering `ThemeProvider` in a jsdom environment.

### D3 — Tailwind `dark:` utilities approach (not CSS custom property swapping)

`dark:bg-surface-dark` pattern keeps styling co-located with the component markup, consistent with how all current tokens are used. CSS variable swapping (defining `--color-surface` and overriding in `.dark {}`) would require refactoring the entire token system. The `dark:` approach is additive and lower risk.

Token naming extends the existing `surface`, `border`, `content` groups:
```
surface.dark, surface.dark-muted, surface.dark-overlay
border.dark, border.dark-strong
content.dark, content.dark-muted, content.dark-subtle
```
`primary`, `destructive`, and `success` intentionally have no dark variants — they are saturated brand/semantic colors that read well on both backgrounds.

### D4 — Active state shows user preference, not resolved theme

The `ThemeSwitcher` highlights the option that matches `preference` (e.g. "System"), not the computed light/dark result. This is the established UX pattern (macOS System Settings, VS Code, etc.) — users understand "System" as a distinct choice. Alternative: show computed result (e.g. highlight "Dark" when system is dark and preference is "System") — rejected as confusing: clicking the already-highlighted option would do nothing.

### D5 — `matchMedia` listener managed inside `ThemeProvider`, not inside the store

Placing the listener in the store would create a side-effecting store that is harder to clean up and impossible to test without DOM globals. `ThemeProvider`'s `useEffect` cleanup (`removeEventListener`) integrates naturally with React's lifecycle.

### D6 — Placement: AuthLayout (beside LanguageSwitcher) + AppLayout new header row + Profile settings row

Auth pages need the switcher because the user's first interaction might be on the login screen. The app pages need it in a persistent header since AppLayout has no header yet. Profile provides a discoverable settings home. The ThemeSwitcher is intentionally lightweight (no navigation required to find it).

### D7 — Persistence via Zustand `persist` to `localStorage`

`localStorage` is consistent with how i18next persists language preference. The `storage.ts` utility is for auth tokens only — theme preference does not need the Zalo `nativeStorage` layer since it is not sensitive and localStorage works correctly in both the Zalo container and the browser dev environment.

## Risks / Trade-offs

- **SSR/initial flash**: The app is a Zalo Mini App (SPA, no SSR), so there is no meaningful FOUC risk — React hydrates immediately from localStorage via Zustand `persist`.
- **`zmp-ui` theme completeness**: Setting `body[zaui-theme="dark"]` activates zmp-ui's own dark styles, but zmp-ui's coverage of dark tokens is outside our control. If zmp-ui components look wrong in dark mode, that is a follow-up concern.
- **100% coverage enforcement**: `ThemeProvider` contains a `matchMedia` event listener — branches for the system path and the cleanup function must be tested. The `matchMedia` API needs a mock in jsdom. This is straightforward but must be included in the test file.
- **Tailwind purge**: New tokens added to `tailwind.config.js` are only included in the build if they appear in a source file. The `ThemeSwitcher` and `ThemeProvider` files will reference them; no extra safelist is needed.

## Migration Plan

No migration is required. The change is purely additive:
1. Tailwind tokens are new keys — existing classes are unaffected.
2. `ThemeProvider` defaults to `'system'` preference on first load (no persisted value), which resolves to the OS setting, preserving the status quo for existing users.
3. DOM attributes are set idempotently; running without `ThemeProvider` simply leaves both attributes unset (current behavior).

## Open Questions

None — all decisions finalized in the exploration session before this change was created.
