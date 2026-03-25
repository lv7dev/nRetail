## Context

`zmp-ui` defines four CSS custom properties on `:root` in its global stylesheet:

```css
:root {
  --zaui-safe-area-inset-top:    env(safe-area-inset-top, 0px);
  --zaui-safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --zaui-safe-area-inset-left:   env(safe-area-inset-left, 0px);
  --zaui-safe-area-inset-right:  env(safe-area-inset-right, 0px);
}
```

The previous `fix-zalo-safe-area` change used `--zaui-safe-area-top` / `--zaui-safe-area-bottom` (missing `inset`) — these are undefined variables that silently fall back to `0px`. Additionally, `hideIOSSafeAreaBottom: true` tells the Zalo native host to shrink the WebView's bottom inset to zero on iOS, causing `env(safe-area-inset-bottom, 0px)` — and therefore `--zaui-safe-area-inset-bottom` — to always be `0px` on iOS, defeating the BottomNav fix entirely.

## Goals / Non-Goals

**Goals:**
- Replace all occurrences of `--zaui-safe-area-top` with `--zaui-safe-area-inset-top`
- Replace all occurrences of `--zaui-safe-area-bottom` with `--zaui-safe-area-inset-bottom`
- Set `hideIOSSafeAreaBottom: false` so iOS exposes the real home indicator inset to the WebView

**Non-Goals:**
- Changing any visual design or spacing beyond correcting the variable names
- Addressing Android bottom inset (Android system nav bar sits outside the WebView; `env(safe-area-inset-bottom)` is typically `0px` on Android regardless of `hideAndroidBottomNavigationBar`)

## Decisions

### Fix variable names in `app.css` only — cascades to AppLayout automatically
`AppLayout.tsx` consumes `.pt-safe` via className. Only `app.css` needs the variable name corrected; `AppLayout.tsx` requires no code change.

### Set `hideIOSSafeAreaBottom: false`
When `true`, the Zalo host actively zeros the WebView's bottom safe area on iOS — the CSS variable resolves correctly at the CSS level, but the underlying `env()` value is already `0px` before the variable is evaluated. Setting it to `false` lets the Zalo host pass the real inset (≈34px on Face ID iPhones, ≈0px on Android) through to the WebView.

**Alternative considered**: Hardcode the bottom offset in JS (e.g., `window.ZaloJavaScriptInterface.getSafeAreaInsetBottom()`). Rejected — CSS-only is simpler, no JS bridge required, and degrades cleanly to `0px` outside Zalo.

## Risks / Trade-offs

- **`hideIOSSafeAreaBottom: false` may expose extra blank space at the bottom on iOS** → Mitigation: BottomNav is already fixed-positioned and uses `--zaui-safe-area-inset-bottom` as its offset, so the space is correctly occupied by the nav bar lifting up rather than leaving a gap.
- **`env(safe-area-inset-*)` in tests/browser** → Both variables default to `0px` outside Zalo; no test changes needed.

## Migration Plan

1. Update `app.css` variable names (fixes `.pt-safe`/`.pb-safe` and cascades to `AppLayout`)
2. Update `AuthLayout.tsx` inline style
3. Update `BottomNav.tsx` inline style
4. Update `app-config.json`

Rollback: revert the four files. No data or API migration needed.
