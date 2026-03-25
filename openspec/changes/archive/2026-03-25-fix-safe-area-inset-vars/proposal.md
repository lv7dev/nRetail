## Why

The previous `fix-zalo-safe-area` change used incorrect CSS variable names (`--zaui-safe-area-top` / `--zaui-safe-area-bottom`) — these variables do not exist in `zmp-ui`. The correct names are `--zaui-safe-area-inset-top` / `--zaui-safe-area-inset-bottom`. Additionally, `hideIOSSafeAreaBottom: true` in `app-config.json` instructs the Zalo host to zero out the iOS bottom safe area inset, making `--zaui-safe-area-inset-bottom` always resolve to `0px` on iOS — effectively defeating the BottomNav fix.

## What Changes

- `src/css/app.css`: Rename `--zaui-safe-area-top` → `--zaui-safe-area-inset-top` in `.pt-safe`, and `--zaui-safe-area-bottom` → `--zaui-safe-area-inset-bottom` in `.pb-safe`.
- `src/components/AuthLayout.tsx`: Fix inline style to use `--zaui-safe-area-inset-top`.
- `src/components/AppLayout.tsx`: No code change needed (uses `.pt-safe` class — fixed by updating `app.css`).
- `src/components/shared/BottomNav.tsx`: Fix inline style to use `--zaui-safe-area-inset-bottom`.
- `app-config.json`: Change `hideIOSSafeAreaBottom` from `true` → `false` so the Zalo host exposes the real bottom inset to the WebView on iOS, making `--zaui-safe-area-inset-bottom` return the actual home indicator height (~34px) instead of `0px`.

## Capabilities

### New Capabilities

<!-- None — this is a bug fix for an existing capability -->

### Modified Capabilities

- `zalo-safe-area`: The variable names used to implement the safe area requirements are corrected; the iOS bottom inset suppression is removed so the bottom safe area variable resolves to a real value on iOS devices.

## Impact

- `miniapp/app-config.json` — `hideIOSSafeAreaBottom` changes from `true` to `false`; on iOS the WebView will now receive the full bottom inset from the Zalo host
- `miniapp/src/css/app.css`
- `miniapp/src/components/AuthLayout.tsx`
- `miniapp/src/components/shared/BottomNav.tsx`
- No new dependencies; no API changes
