## ADDED Requirements

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
In outer mode, `TabbedView.Panels` SHALL record the user's last scroll position for the outgoing tab whenever the active tab changes. The saved value SHALL be the `scrollTop` from the most recent `scroll` event on the outer container, not `outerScrollRef.current.scrollTop` read at layout time after `display: none` may have clamped it.

#### Scenario: ScrollTop is saved when switching away from a tab
- **WHEN** the outer scroll is at `800px` and the user switches from Tab A to Tab B
- **THEN** the saved position for Tab A is `800`

#### Scenario: Correct position is saved after outgoing content shrinks
- **WHEN** Tab A grows via load-more, the user scrolls to `X`, and switching to Tab B causes the browser to clamp the current `outerScrollRef.current.scrollTop` down to `Y` where `Y < X`
- **THEN** the saved position for Tab A remains `X`, the user's last actual scroll position before the switch

---

### Requirement: Outer mode restores saved scrollTop when returning to a tab
In outer mode, when switching to a tab that has a previously saved scroll position, `TabbedView.Panels` SHALL set `outerScrollRef.current.scrollTop` to the saved value immediately after updating the active tab.

#### Scenario: Returning to a tab restores position
- **WHEN** Tab A was previously scrolled to `800px` and the user switches back to Tab A from Tab B
- **THEN** `outerScrollRef.current.scrollTop` is set to `800`

---

### Requirement: Outer mode scrolls to component offsetTop on first tab visit
In outer mode, when switching to a tab that has no saved position (first visit), `TabbedView.Panels` SHALL set `outerScrollRef.current.scrollTop` to the `TabbedView.Panels` root element's `offsetTop`, so the user sees the tab content starting at the top of the viewport with the sticky TabBar aligned.

#### Scenario: First visit scrolls to component top
- **WHEN** the user switches to Tab B for the first time (no saved position)
- **THEN** the outer scroll container scrolls to `tabbedViewPanelsRef.current.offsetTop`

#### Scenario: Subsequent visits restore saved position
- **WHEN** the user has previously scrolled Tab B to `600px`, left, and returns to Tab B
- **THEN** the outer scroll restores to `600`, not `offsetTop`
