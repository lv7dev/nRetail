## Why

The miniapp has no dark-mode support despite `tailwind.config.js` already specifying `darkMode: "class"`. Users increasingly expect light/dark/system theme control, and `zmp-ui` (the Zalo platform UI library) also requires its own attribute (`body[zaui-theme]`) to be synchronized. This change establishes the full theme infrastructure so all subsequent UI work can use `dark:` utilities immediately.

## What Changes

- **New Tailwind dark tokens** — extend `tailwind.config.js` with dark-mode counterparts for surface, border, and content color groups.
- **New `useThemeStore`** — Zustand store (with `persist` middleware) holding the user's preference (`'light' | 'dark' | 'system'`).
- **New `ThemeProvider`** — component that reads the store, computes the resolved theme (system follows `prefers-color-scheme`), and keeps two DOM attributes in sync: `html.dark` class (Tailwind) and `body[zaui-theme]` (zmp-ui).
- **New `ThemeSwitcher`** — dropdown component matching the `LanguageSwitcher` pattern, with three options: Light / System / Dark.
- **Layout integration** — `ThemeSwitcher` placed in `AuthLayout` (next to `LanguageSwitcher`), in a new `AppLayout` header row, and as a settings row in the Profile page.
- **`app.tsx` integration** — `ThemeProvider` wraps the app inside `QueryClientProvider`.

## Capabilities

### New Capabilities

- `theme-preference`: User can select and persist a theme preference (light / dark / system), with system option auto-tracking OS preference via `matchMedia`.
- `theme-switcher-ui`: A dropdown `ThemeSwitcher` component renders the three options, shows the active preference, and is accessible from all app contexts (auth pages, app pages, profile settings).
- `theme-dom-sync`: When the resolved theme changes, the DOM is updated atomically — `html.classList` toggled for Tailwind `dark:` utilities and `body.zaui-theme` attribute set for zmp-ui dark styling.

### Modified Capabilities

## Impact

- `miniapp/tailwind.config.js` — adds dark color tokens under `surface`, `border`, and `content`.
- `miniapp/src/store/useThemeStore.ts` — new Zustand store with `persist`.
- `miniapp/src/components/ThemeProvider.tsx` — new component; inserted in `app.tsx`.
- `miniapp/src/components/shared/ThemeSwitcher/` — new component folder.
- `miniapp/src/components/AuthLayout.tsx` — adds `ThemeSwitcher` beside `LanguageSwitcher`.
- `miniapp/src/components/AppLayout.tsx` — adds header row with `ThemeSwitcher` and `LanguageSwitcher`.
- `miniapp/src/pages/profile.tsx` — adds theme settings row.
- No backend changes. No new npm dependencies (Zustand `persist` middleware is already part of `zustand`).
