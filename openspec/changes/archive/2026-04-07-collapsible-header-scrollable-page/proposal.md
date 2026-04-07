## Why

The home page (and future list pages) need two reusable scroll-driven UI patterns: a header that holds a contextual card which collapses to a compact pill on scroll, and a page wrapper that provides pull-to-refresh and infinite load-more. Without these, each page would re-implement scroll mechanics independently, diverging in behavior and quality.

## What Changes

- **New `CollapsibleHeader` component** (`components/shared/`): a sticky header zone with `topBar`, `children` (sub-header content), and `card` props. The `card` collapses to a pill when the user scrolls down and re-expands when they scroll back up — using `IntersectionObserver` on a sentinel element for efficiency.
- **New `ScrollablePage` component** (`components/shared/`): a full-height scroll container that accepts `onRefresh`, `onLoadMore`, `hasMore`, `isRefreshing`, and `isLoadingMore` props. Implements pull-to-refresh via touch events and load-more via `IntersectionObserver` on a bottom sentinel.
- **Home page updated** to use both components: `CollapsibleHeader` with `OutletContextCard` as the `card` prop, `ScrollablePage` as the scroll zone for all home sections.
- **`QuickActionsGrid` renamed/refactored** into `OutletContextCard` — separates the outlet context display from the quick actions grid, making the card usable inside `CollapsibleHeader`.

## Capabilities

### New Capabilities

- `collapsible-header`: A shared header component that accepts an arbitrary `card` slot. The card collapses to a pill on scroll (IntersectionObserver-driven) and sticks just below the sub-header content. Layout is: `topBar` (fixed) → `children` (blue zone, e.g. SearchBar) → `card` (collapsible, sticky).
- `scrollable-page`: A shared scroll container component that wraps page content and provides pull-to-refresh (touch events) and infinite load-more (IntersectionObserver bottom sentinel). Calls `onRefresh` and `onLoadMore` callbacks, leaving data fetching to TanStack Query in the page.

### Modified Capabilities

- `outlet-context-ui`: The outlet name display moves from `QuickActionsGrid`'s header row into a dedicated `OutletContextCard` component designed to slot into `CollapsibleHeader`. Behavior (tap → `/outlets`, preserve outlet on back) is unchanged.

## Impact

- `miniapp/src/components/shared/CollapsibleHeader/` — new component
- `miniapp/src/components/shared/ScrollablePage/` — new component
- `miniapp/src/pages/home/QuickActionsGrid.tsx` → refactored; outlet name row extracted into `OutletContextCard.tsx`
- `miniapp/src/pages/home/index.tsx` — updated to compose `CollapsibleHeader` + `ScrollablePage`
- No backend changes, no new dependencies
