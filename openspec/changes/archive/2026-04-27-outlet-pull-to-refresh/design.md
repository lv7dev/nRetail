## Context

`TabbedView.Panels mode="self"` wraps each panel in a `ScrollablePage` (via `cloneElement`). `ScrollablePage` has `flex-1 min-h-0 overflow-y-auto` but neither `TabbedViewPanels` (the `panelsRef` div) nor `TabbedViewPanel` (the show/hide div) are flex containers, so `flex-1` has no effect. The scroll container is only as tall as its content. When content is shorter than the viewport, touch and wheel events below the content hit ancestor elements, not `ScrollablePage`, so pull-to-refresh never triggers.

Additionally, `OutletListPage` never passes `onRefresh` or `isRefreshing` to its panels. `ScrollablePage` early-exits its event setup when `onRefresh` is undefined, so the feature is completely dead regardless of layout.

## Goals / Non-Goals

**Goals:**
- `mode="self"` panels always fill the available height so `ScrollablePage` is always the hit target for touch/wheel events
- Pull-to-refresh is wired on both outlet list tabs, refreshing only the active tab's query
- `isRefreshing` shows the spinner during a refresh but NOT during an incremental load-more fetch

**Non-Goals:**
- Changes to `mode="outer"` layout or scroll-save behavior
- Pull-to-refresh on any page other than the outlet list
- Changing `ScrollablePage` internals

## Decisions

### Flex propagation via `className` injection (not context)

`TabbedViewPanels` passes `className="flex flex-col flex-1 min-h-0"` to each `TabbedViewPanel` via `cloneElement`, and `TabbedViewPanel` applies it to its outer div. The `TabbedViewPanels` wrapper div gets the same classes when `mode="self"`.

**Why not context?** Avoids adding a new context value (`mode`) just for a CSS concern. The `cloneElement` path already injects `ScrollablePage` in `mode="self"` — adding `className` alongside it keeps the logic co-located and doesn't require `TabbedViewPanel` to know about `mode` at all.

**Why not `mode="outer"` flex?** In outer mode, panels are plain content wrappers inside a single outer scroll container. Adding flex sizing there would interfere with the outer container's height calculation, which depends on panels stacking at natural height.

The flex chain after the fix:
```
div.flex.min-h-0.flex-1.flex-col  ← outlet page content area (already flex)
  └── panelsRef div  [+flex flex-col flex-1 min-h-0]  ← fills remaining space
        └── TabbedViewPanel div  [+flex flex-col flex-1 min-h-0]  ← fills panelsRef
              └── ScrollablePage  [flex-1 min-h-0 overflow-y-auto]  ← fills panel ✓
```

### `isRefreshing` = `isFetching && !isFetchingNextPage`

`isFetching` alone would show the refresh spinner during load-more scrolling. `isFetchingNextPage` isolates incremental fetches. The compound flag shows the spinner for initial loads and manual refreshes only.

### `onRefresh` passed to both panels, active tab enforced by layout

Both panels receive `onRefresh` unconditionally (`connectedQuery.refetch()` and `notConnectedQuery.refetch()` respectively). Inactive panels are hidden via `display: none`, so the user can never trigger refresh on the inactive tab. No conditional prop logic needed in `OutletListPage`.

## Risks / Trade-offs

- **`className` as internal injection contract** — `TabbedViewPanel` now accepts a `className` prop that callers could misuse. Risk is low (internal component, not exported as a public API surface), but the prop should not be documented as intended for caller use.
- **`flex-1` on `TabbedViewPanels` wrapper** — If a caller places `TabbedView.Panels mode="self"` inside a non-flex parent, the `flex-1` is still a no-op for the wrapper, but the inner chain still works (each panel fills the wrapper div's height). The wrapper only fails to fill its parent. This is acceptable — mode="self" callers are expected to provide a flex container parent.
