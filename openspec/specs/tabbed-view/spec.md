## Requirements

### Requirement: TabbedView provides Context connecting TabBar and Panels
`TabbedView` SHALL wrap its children in a React Context that exposes `activeTab` (string) and `onTabChange` (function). `TabbedView.TabBar` and `TabbedView.Panels` SHALL read from this context, allowing them to be placed anywhere in the component tree as long as they are descendants of `TabbedView`.

#### Scenario: TabBar and Panels communicate via context
- **WHEN** `TabbedView.TabBar` and `TabbedView.Panels` are rendered as descendants of `TabbedView` but in separate DOM subtrees
- **THEN** clicking a tab in `TabbedView.TabBar` changes the visible panel in `TabbedView.Panels`

#### Scenario: TabbedView supports controlled mode
- **WHEN** `TabbedView` receives `activeTab` and `onTabChange` props
- **THEN** the active tab state is controlled externally; internal state is overridden by the prop

---

### Requirement: TabbedView.TabBar renders the generic TabBar connected to context
`TabbedView.TabBar` SHALL render the `TabBar` UI component, passing `activeTab` from context and calling `onTabChange` when a tab is clicked. It SHALL accept a `className` prop forwarded to `TabBar`.

#### Scenario: Tab click updates context active tab
- **WHEN** a user clicks a tab in `TabbedView.TabBar`
- **THEN** the context `activeTab` updates to that tab's key

---

### Requirement: All panels stay mounted; inactive panels are hidden with display:none
`TabbedView.Panels` SHALL render all `TabbedView.Panel` children simultaneously. Inactive panels (those whose `tabKey` does not match `activeTab`) SHALL have `style={{ display: 'none' }}` applied. Active panels SHALL have no display override.

#### Scenario: Inactive panel is hidden
- **WHEN** `activeTab` is `'bought'`
- **THEN** the panel with `tabKey="viewed"` has `display: none` and is not visible

#### Scenario: Active panel is visible
- **WHEN** `activeTab` is `'bought'`
- **THEN** the panel with `tabKey="bought"` has no display override and is visible

#### Scenario: All panels remain in the DOM
- **WHEN** the user switches between tabs multiple times
- **THEN** all panel elements remain mounted throughout — none are unmounted and remounted

---

### Requirement: Self-scroll mode — each panel owns a ScrollablePage
In `mode="self"`, each `TabbedView.Panel` SHALL render a `ScrollablePage` as its scroll container. The panel SHALL accept `onRefresh`, `onLoadMore`, `hasMore`, `isRefreshing`, and `isLoadingMore` props and forward them to its internal `ScrollablePage`.

#### Scenario: Panel renders ScrollablePage in self-scroll mode
- **WHEN** `TabbedView.Panels` has `mode="self"` and a panel has `onLoadMore` provided
- **THEN** that panel contains a `ScrollablePage` with a load-more sentinel

#### Scenario: Self-scroll preserves scroll position across tab switches
- **WHEN** the user scrolls down in Tab A, switches to Tab B, then switches back to Tab A
- **THEN** Tab A's scroll position is unchanged (scroll container was never unmounted)

---

### Requirement: Outer-scroll mode — panels delegate scroll to an external container
In `mode="outer"`, `TabbedView.Panels` SHALL accept an `outerScrollRef` prop pointing to an external scroll container (e.g., a `ScrollablePage`). Panels SHALL render as plain content wrappers with no internal scroll container. The external `ScrollablePage` provides all scroll, refresh, and load-more behaviour.

#### Scenario: Panel in outer mode has no own scroll container
- **WHEN** `TabbedView.Panels` has `mode="outer"`
- **THEN** no `ScrollablePage` is rendered inside any panel; the panel's root is a plain `<div>`

---

### Requirement: Outer mode saves per-tab scrollTop on tab switch
In outer mode, `TabbedView.Panels` SHALL record the user's last scroll position for the outgoing tab whenever the active tab changes. The saved value SHALL be the `scrollTop` from the most recent `scroll` event on the outer container — not `outerScrollRef.current.scrollTop` read at layout time, which may be clamped by the browser after `display: none` reduces scroll height.

Implementation: `TabbedViewPanels` SHALL maintain a `lastKnownScrollTopRef` updated by a passive `scroll` event listener on `outerScrollRef.current` (attached in outer mode only). The save step in `useLayoutEffect` SHALL use `lastKnownScrollTopRef.current` as the value to store.

#### Scenario: ScrollTop is saved when switching away from a tab
- **WHEN** the outer scroll is at `800px` and the user switches from Tab A to Tab B
- **THEN** the saved position for Tab A is `800`

#### Scenario: Correct position saved after load-more grows the tab content
- **WHEN** Tab A starts with 8 items, load-more adds 4 more items (total 12), the user scrolls to the bottom (scrollTop = X, showing item 12), and then switches to Tab B (which has 8 items, max scrollTop = Y where Y < X)
- **THEN** the saved position for Tab A is X (the pre-switch user position), not Y (the browser-clamped value)

#### Scenario: Returning to a tab restores the correct position after load-more
- **WHEN** the scenario above has occurred and the user switches back to Tab A
- **THEN** `outerScrollRef.current.scrollTop` is set to X, showing item 12 (not item 8)

#### Scenario: Scroll listener is only attached in outer mode
- **WHEN** `TabbedView.Panels` is in `mode="self"`
- **THEN** no scroll listener is attached to any outer container

---

### Requirement: Outer mode restores saved scrollTop when returning to a tab
In outer mode, when switching to a tab that has a previously saved scroll position, `TabbedView.Panels` SHALL set `outerScrollRef.current.scrollTop` to the saved value immediately after updating the active tab.

#### Scenario: Returning to a tab restores position
- **WHEN** Tab A was previously scrolled to `800px` and the user switches back to Tab A from Tab B
- **THEN** `outerScrollRef.current.scrollTop` is set to `800`

---

### Requirement: Outer mode scrolls to component top on first tab visit, accounting for sticky siblings
In outer mode, when switching to a tab that has no saved position (first visit), `TabbedView.Panels` SHALL compute the target scroll position using `getBoundingClientRect()` on both the panels root element and the outer scroll container, subtract the height of any directly preceding sibling that has `position: sticky` (e.g. a sticky `TabbedView.TabBar`), and set `outerScrollRef.current.scrollTop` to this value synchronously before the browser paints (via `useLayoutEffect`).

The calculation SHALL be:
```
stickyOffset = (prevSibling && getComputedStyle(prevSibling).position === 'sticky')
               ? prevSibling.getBoundingClientRect().height
               : 0

targetScrollTop = outerScrollElement.scrollTop
                  + panelsRef.current.getBoundingClientRect().top
                  - outerScrollElement.getBoundingClientRect().top
                  - stickyOffset
```

#### Scenario: First visit scrolls to component top without flash
- **WHEN** the user switches to a tab for the first time (no saved scroll position)
- **THEN** the outer scroll container's `scrollTop` is updated before the browser paints, with no visible flash

#### Scenario: First visit accounts for sticky TabBar sibling
- **WHEN** `TabbedView.TabBar` is a direct preceding sibling of `TabbedView.Panels` with `position: sticky`
- **THEN** the target `scrollTop` is reduced by the TabBar's rendered height so the first panel item appears below the TabBar, not behind it

#### Scenario: Sticky offset is zero when TabBar is not a sibling
- **WHEN** `TabbedView.TabBar` is placed in a header (Mode 3) and is not a DOM sibling of `TabbedView.Panels`
- **THEN** `stickyOffset` is `0` and the calculation is unaffected

#### Scenario: Subsequent visits restore saved position
- **WHEN** the user has previously scrolled a tab and returns to it
- **THEN** the outer scroll restores the saved `scrollTop` value directly, without any sticky offset adjustment
