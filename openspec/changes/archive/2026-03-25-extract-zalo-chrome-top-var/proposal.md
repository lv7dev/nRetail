## Why

`AuthLayout.tsx` currently positions the LanguageSwitcher with an inline `calc(var(--zaui-safe-area-inset-top, 0px) + 1.6rem)`. The `1.6rem` is a magic number representing the height of Zalo's minimal chrome strip (the "..." × controls shown even when `actionBarHidden: true`). Zalo exposes no CSS variable for this height, so the constant lives embedded inside a component's inline style — invisible and easy to get wrong if Zalo ever changes their chrome. Extracting it to a named CSS custom property makes the intent explicit and gives one place to update if the value ever changes.

## What Changes

- `src/css/app.css`: Define `--zalo-chrome-top` on `:root` as `calc(var(--zaui-safe-area-inset-top, 0px) + 1.6rem)` — combining the OS safe area inset with the empirical Zalo chrome strip height.
- `src/components/AuthLayout.tsx`: Replace the inline `calc(...)` style with `var(--zalo-chrome-top)`.

## Capabilities

### New Capabilities

<!-- None — this is a refactor/naming improvement, no new behaviour -->

### Modified Capabilities

- `zalo-safe-area`: The LanguageSwitcher positioning requirement now references `--zalo-chrome-top` as the named constant for the combined OS + Zalo chrome offset.

## Impact

- `miniapp/src/css/app.css`
- `miniapp/src/components/AuthLayout.tsx`
- No runtime behaviour change; no new dependencies
