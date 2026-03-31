## Why

SVG icons in the app always render black because the Icon component never sets `fill="currentColor"`, causing browsers to apply the SVG default fill (`black`) instead of inheriting from the parent's text color. This makes all icons invisible or hard to read in dark mode.

## What Changes

- Add `fill="currentColor"` to the Icon component so icons inherit their color from the surrounding text color
- Replace hardcoded inline `style={{ color: ... }}` in BottomNav with Tailwind classes that support `dark:` variants, so inactive nav icons lighten in dark mode

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `icon-color-inheritance`: Icon component must render with `fill="currentColor"` so icon fill tracks the CSS `color` property
- `bottom-nav-dark-mode`: BottomNav active/inactive icon colors must use Tailwind token classes instead of hardcoded hex values, enabling proper dark mode switching

## Impact

- `src/components/ui/Icon/Icon.tsx` — add `fill="currentColor"` prop to rendered SVG
- `src/components/shared/BottomNav.tsx` — replace inline style color with conditional Tailwind classes (`text-primary` active, `text-content-muted dark:text-content-dark-muted` inactive)
- All components that use `<Icon>` now correctly inherit their parent's text color — LanguageSwitcher, ThemeSwitcher, PasswordInput icons all fixed automatically
