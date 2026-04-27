## MODIFIED Requirements

### Requirement: Self-scroll mode — each panel owns a ScrollablePage
In `mode="self"`, each `TabbedView.Panel` SHALL render a `ScrollablePage` as its scroll container. The panel SHALL accept `onRefresh`, `onLoadMore`, `hasMore`, `isRefreshing`, and `isLoadingMore` props and forward them to its internal `ScrollablePage`.

`TabbedViewPanels` SHALL apply `flex flex-col flex-1 min-h-0` to its wrapper div in `mode="self"`. Each `TabbedViewPanel` SHALL apply `flex flex-col flex-1 min-h-0` to its own div (injected via `className` by `TabbedViewPanels` through `cloneElement`). This ensures `ScrollablePage`'s `flex-1` fills the available height regardless of content length, so touch and wheel events always reach the scroll container.

#### Scenario: Panel renders ScrollablePage in self-scroll mode
- **WHEN** `TabbedView.Panels` has `mode="self"` and a panel has `onLoadMore` provided
- **THEN** that panel contains a `ScrollablePage` with a load-more sentinel

#### Scenario: Self-scroll preserves scroll position across tab switches
- **WHEN** the user scrolls down in Tab A, switches to Tab B, then switches back to Tab A
- **THEN** Tab A's scroll position is unchanged (scroll container was never unmounted)

#### Scenario: Self-scroll panels fill available height when content is short
- **WHEN** `TabbedView.Panels mode="self"` is rendered and the active panel's content is shorter than the viewport
- **THEN** the `ScrollablePage` container still fills the full available height (touch and wheel events reach it across the entire area)

#### Scenario: Flex chain is not applied in outer mode
- **WHEN** `TabbedView.Panels` has `mode="outer"`
- **THEN** no flex classes are added to the panels wrapper or any panel div
