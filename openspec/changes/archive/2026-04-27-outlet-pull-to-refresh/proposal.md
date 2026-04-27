## Why

When the outlet list has fewer items than the viewport, `TabbedView.Panels mode="self"` panels do not fill the available screen height, so pull-to-refresh touch and wheel events fall outside the `ScrollablePage` hit area. The outlet list also never passes `onRefresh` or `isRefreshing` to its panels, so refresh is completely unwired.

## What Changes

- `TabbedViewPanels` and `TabbedViewPanel` propagate flex sizing in `mode="self"` so the `ScrollablePage` fills the full available height regardless of content length
- `TabbedView.Panel` accepts a `className` prop (injected internally by `TabbedViewPanels` in `mode="self"`; not a public API concern)
- `OutletListPage` wires `onRefresh` (calls the active tab's `refetch`) and `isRefreshing` (`isFetching && !isFetchingNextPage`) on both `TabbedView.Panel` components

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `tabbed-view`: `mode="self"` panels SHALL fill available height — `TabbedViewPanels` and `TabbedViewPanel` must form a flex chain so `ScrollablePage.flex-1` takes effect
- `outlet-list-ui`: both tabs SHALL support pull-to-refresh wired to their respective TanStack Query `refetch`

## Impact

- `miniapp/src/components/shared/TabbedView/TabbedViewPanels.tsx` — conditional flex classes on wrapper div; pass `className` via `cloneElement`
- `miniapp/src/components/shared/TabbedView/TabbedViewPanel.tsx` — accept and apply `className` prop
- `miniapp/src/pages/outlets/index.tsx` — add `onRefresh` and `isRefreshing` to both panels
- Existing `TabbedView` tests and `OutletListPage` tests will need updating for the new flex classes and props
