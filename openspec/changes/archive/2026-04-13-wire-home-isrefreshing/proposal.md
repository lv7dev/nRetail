## Why

The pull-to-refresh spinner on the home page disappears the moment the finger lifts, before the refresh has completed. `ScrollablePage` already supports an `isRefreshing` prop to keep the spinner alive during the loading phase, but `HomePage` does not pass it — and `useHomeRefresh` does not yet expose the flag.

## What Changes

- `useHomeRefresh` returns an `isRefreshing: boolean` field alongside `refetch`
- `HomePage` passes `isRefreshing={isRefreshing}` to `<ScrollablePage>`
- `handleTouchEnd` in `ScrollablePage` is fixed to keep `pullDistance > 0` until `onRefresh()` resolves, so the spinner persists through the refresh even when `isRefreshing` is not yet driven by a real query

## Capabilities

### New Capabilities
<!-- None — ScrollablePage already specifies this behavior -->

### Modified Capabilities
<!-- The scrollable-page spec already requires "The indicator disappears when isRefreshing returns to false."
     No spec-level requirement changes — this is a wiring and implementation fix. -->

## Impact

- `miniapp/src/pages/home/useHomeRefresh.ts` — add `isRefreshing` to return shape
- `miniapp/src/pages/home/useHomeRefresh.test.ts` — test the new return field
- `miniapp/src/pages/home/index.tsx` — pass `isRefreshing` prop
- `miniapp/src/pages/home/index.test.tsx` — assert `isRefreshing` is forwarded
- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — fix `handleTouchEnd` to await `onRefresh()` before clearing `pullDistance`
- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.test.tsx` — test that spinner persists until `onRefresh()` resolves
