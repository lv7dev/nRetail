## Why

The Zalo Mini App runs inside an iframe on iOS and Android. With `statusBar: "transparent"` and `actionBarHidden: true` in `app-config.json`, the OS status bar overlays the very top of the app and the device home indicator/Android nav bar can overlap the bottom. Zalo exposes `--zaui-safe-area-top` and `--zaui-safe-area-bottom` CSS variables to compensate, but none of the layouts currently consume them — the LanguageSwitcher in AuthLayout is hidden under the status bar, and BottomNav content can be clipped at the bottom.

## What Changes

- `AuthLayout.tsx`: LanguageSwitcher position shifts from `top-1rem` to `calc(var(--zaui-safe-area-top, 0px) + 1rem)` so it clears the OS status bar.
- `AppLayout.tsx`: Page content area gets `padding-top: var(--zaui-safe-area-top, 0px)` so nothing is hidden under the transparent status bar.
- `BottomNav.tsx`: Bottom offset shifts from `bottom-0` to `bottom: var(--zaui-safe-area-bottom, 0px)` so the nav bar clears the home indicator / Android nav.
- `src/css/app.css`: Two utility classes — `.pt-safe` and `.pb-safe` — are added so future components can opt in to safe-area spacing without repeating the `calc()` pattern.

## Capabilities

### New Capabilities

- `zalo-safe-area`: CSS safe-area compensation for Zalo Mini App's transparent status bar and bottom home indicator, using `--zaui-safe-area-top` and `--zaui-safe-area-bottom` CSS variables exposed by the Zalo platform.

### Modified Capabilities

<!-- No existing spec-level behavior changes -->

## Impact

- `miniapp/src/components/AuthLayout.tsx`
- `miniapp/src/components/AppLayout.tsx`
- `miniapp/src/components/shared/BottomNav.tsx`
- `miniapp/src/css/app.css`
- No new dependencies; no API changes; layout-only fix
