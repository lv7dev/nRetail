## Why

Page content in the authenticated app shell scrolls behind the fixed `BottomNav`, hiding the last section from users who never know to scroll further. Additionally, the `ThemeSwitcher` and `LanguageSwitcher` controls clutter the `AppLayout` header — they belong in the Settings page, not on every screen.

## What Changes

- **BottomNav overlap fix**: `BottomNav` gains a `ref` fed to a `ResizeObserver` that measures the nav's rendered height and writes it as `--bottom-nav-height` on `:root`. `AppLayout`'s `page-content` div uses `paddingBottom: calc(var(--bottom-nav-height, 3.5rem) + var(--zaui-safe-area-inset-bottom, 0px))` so content always clears the nav. The `3.5rem` fallback eliminates first-render flash.
- **Remove ThemeSwitcher + LanguageSwitcher from AppLayout**: The header row containing both switchers is removed from `AppLayout`. The components remain available in `AuthLayout` and the Account/Settings page.
- **Update `theme-switcher-ui` spec**: Remove the requirement that `AppLayout` renders a header row with `ThemeSwitcher` and `LanguageSwitcher`.

## Capabilities

### New Capabilities
- `bottom-nav-scroll-clearance`: BottomNav dynamically exposes its rendered height as a CSS variable via ResizeObserver; AppLayout consumes it to ensure page content is never obscured by the nav bar.

### Modified Capabilities
- `theme-switcher-ui`: Remove placement requirement for `AppLayout` — ThemeSwitcher and LanguageSwitcher are only accessible in `AuthLayout` and the Account page, not on every authenticated screen.

## Impact

- `miniapp/src/components/AppLayout.tsx` — remove switcher imports, add `paddingBottom` style to `page-content`
- `miniapp/src/components/shared/BottomNav.tsx` — add ref + ResizeObserver effect to expose `--bottom-nav-height`
- `miniapp/src/components/AppLayout.test.tsx` — remove assertions for ThemeSwitcher/LanguageSwitcher presence
- `miniapp/src/components/shared/BottomNav.test.tsx` — add test for ResizeObserver CSS variable behavior
- `openspec/specs/theme-switcher-ui/spec.md` — delta: remove AppLayout placement requirement
