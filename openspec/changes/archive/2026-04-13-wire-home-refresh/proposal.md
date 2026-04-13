## Why

The home page passes `() => console.log('refresh')` to `ScrollablePage`'s `onRefresh` prop instead of the `refetch` function from `useHomeRefresh`. As a result, both pull-to-refresh (mobile touch) and wheel-overscroll (desktop) trigger an event but the spinner never appears and no real refresh logic runs.

## What Changes

- Replace the `console.log` placeholder with `onRefresh={refetch}` in `home/index.tsx`
- No changes to `ScrollablePage`, `CollapsibleHeader`, or `useHomeRefresh` — the infrastructure is already correct

## Capabilities

### New Capabilities
<!-- None — this is a wiring fix, not a new feature -->

### Modified Capabilities
<!-- No spec-level requirement changes; scrollable-page spec already covers refresh behavior -->

## Impact

- `miniapp/src/pages/home/index.tsx` — one-line prop change
- `miniapp/src/pages/home/index.test.tsx` — verify `onRefresh` is wired to `refetch`
- No API, dependency, or backend changes
