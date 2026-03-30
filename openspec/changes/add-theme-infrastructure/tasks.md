## 1. Tailwind Dark Tokens

- [x] 1.1 Add dark color tokens to `miniapp/tailwind.config.js` — extend `surface` with `dark`, `dark-muted`, `dark-overlay`; extend `border` with `dark`, `dark-strong`; extend `content` with `dark`, `dark-muted`, `dark-subtle`

## 2. useThemeStore

- [x] 2.1 Write failing tests for `useThemeStore` — test default preference is `'system'`, `setTheme` updates preference to each of the three values, state shape contains only `preference` and `setTheme`, and store resets correctly between tests (`miniapp/src/store/useThemeStore.test.ts`)
- [x] 2.2 Implement `useThemeStore` — create `miniapp/src/store/useThemeStore.ts` using Zustand `create` with `persist` middleware to `localStorage`, key `'theme-preference'`, default `'system'`; export `ThemePreference` type

## 3. ThemeProvider

- [x] 3.1 Write failing tests for `ThemeProvider` — mock `window.matchMedia`, test that `html.classList` and `body[zaui-theme]` are set correctly for each resolved theme, test OS change events fire DOM updates when preference is `'system'`, test listener is cleaned up on unmount, test `zaui-theme` is never set to `'system'` (`miniapp/src/components/ThemeProvider.test.tsx`)
- [x] 3.2 Implement `ThemeProvider` — create `miniapp/src/components/ThemeProvider.tsx`; reads `preference` from `useThemeStore`; computes resolved in a `useEffect`; toggles `document.documentElement.classList`; sets `document.body.setAttribute('zaui-theme', resolved)`; when preference is `'system'`, adds a `matchMedia` `change` listener with cleanup; renders `children` with a React Fragment (no wrapper element)

## 4. ThemeSwitcher Component

- [x] 4.1 Write failing tests for `ThemeSwitcher` — test dropdown is closed initially, trigger opens it, clicking an option calls `setTheme` with correct value and closes dropdown, clicking outside closes dropdown, active option has `text-primary font-medium` class, inactive options have `text-content` class (`miniapp/src/components/shared/ThemeSwitcher/ThemeSwitcher.test.tsx`)
- [x] 4.2 Implement `ThemeSwitcher` — create `miniapp/src/components/shared/ThemeSwitcher/ThemeSwitcher.tsx`; use `useRef` + `useEffect` for outside-click close (same pattern as `LanguageSwitcher`); render three options with icons from `Icon` component; use `cn()` for active state classes; call `useThemeStore().setTheme(value)` on click
- [x] 4.3 Create barrel export — create `miniapp/src/components/shared/ThemeSwitcher/index.ts` re-exporting `ThemeSwitcher`

## 5. Wire Into Layouts and App Entry

- [x] 5.1 Update `miniapp/src/components/AuthLayout.tsx` — add `ThemeSwitcher` import and render it in the top-right floating `div` beside the existing `LanguageSwitcher` (wrap both in a `flex items-center gap-1` container)
- [x] 5.2 Update `miniapp/src/components/AppLayout.tsx` — add a new `flex` header row at the top of the shell (above `.page-content`) positioned with `--zalo-chrome-top` inset, containing `LanguageSwitcher` and `ThemeSwitcher` aligned to the right
- [x] 5.3 Update `miniapp/src/pages/profile.tsx` — add a theme settings row using Tailwind classes, labelled "Giao diện" (or `t('common:theme')`) with `ThemeSwitcher` rendered inline; add locale keys `theme` to `common.json` for both `vi` and `en`
- [x] 5.4 Update `miniapp/src/app.tsx` — import `ThemeProvider` and wrap the app content inside it (inside `QueryClientProvider`, outside `BrowserRouter` or at the same level — before `AuthProvider`)
