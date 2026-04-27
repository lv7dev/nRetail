## ADDED Requirements

### Requirement: Back arrow appears only when navigated from within the app via explicit intent
`OutletListPage` SHALL show the back arrow only when `location.state?.canGoBack` is truthy. The `OutletGuard` redirect (`<Navigate replace />`) never carries this state, so the back arrow is hidden on first app open. Any in-app navigation that pushes to `/outlets` with intent to allow going back MUST pass `{ state: { canGoBack: true } }`.

#### Scenario: Back arrow hidden on first app open
- **WHEN** `OutletGuard` redirects to `/outlets` on first boot (no `canGoBack` in router state)
- **THEN** no back button is rendered in `AppHeader`

#### Scenario: Back arrow visible when navigated from home
- **WHEN** the user taps the outlet card on the home page and is pushed to `/outlets` with `{ state: { canGoBack: true } }`
- **THEN** a back button is visible in `AppHeader`

#### Scenario: Back arrow navigates to previous page
- **WHEN** the user taps the back button on the outlet list page
- **THEN** the app navigates back (history.go(-1))

---

### Requirement: OutletListPage layout uses CollapsibleHeader with TabBar in the header zone
`OutletListPage` SHALL use `CollapsibleHeader` as the top-of-page header. The `topBar` slot SHALL contain the back arrow (when `canGoBack`) and the page title rendered via `AppHeader`. The `children` slot SHALL contain `TabbedView.TabBar` rendered with `variant="on-primary"`. No `card` prop is used. The `SearchInput` component SHALL be rendered in the white content zone (`rounded-t-3xl bg-background`) immediately below `CollapsibleHeader`, outside `TabbedView.Panels`, so it remains visible while the list scrolls.

#### Scenario: TabBar appears inside the red header zone
- **WHEN** `OutletListPage` renders
- **THEN** `TabbedView.TabBar` is a descendant of `CollapsibleHeader`'s children slot (inside the red bg zone), not inside the white content card

#### Scenario: Search bar appears in the white content zone below the header
- **WHEN** `OutletListPage` renders
- **THEN** the `SearchInput` is rendered below `CollapsibleHeader` and above `TabbedView.Panels`, inside the `bg-background` wrapper

#### Scenario: Search bar is always visible while the list scrolls
- **WHEN** the user scrolls the outlet list
- **THEN** the search bar remains visible (it is outside the scroll container)

#### Scenario: TabbedView wraps CollapsibleHeader and Panels
- **WHEN** `OutletListPage` renders
- **THEN** both `CollapsibleHeader` (containing `TabbedView.TabBar`) and `TabbedView.Panels` are descendants of the same `TabbedView` root

---

### Requirement: OutletListPage has tabbed Connected and Not-connected views
`OutletListPage` SHALL render a `TabbedView` with two tabs: **Connected** (outlets the user belongs to) and **Not connected** (outlets available to join). Each tab SHALL fetch independently via `useInfiniteQuery`.

#### Scenario: Connected tab is active by default
- **WHEN** `OutletListPage` mounts
- **THEN** the Connected tab is active and the user's connected outlets are displayed

#### Scenario: User switches to Not connected tab
- **WHEN** the user taps the Not connected tab
- **THEN** the not-connected outlet list is displayed

---

### Requirement: Search bar filters both tabs server-side
`OutletListPage` SHALL render a search input in the white content zone above the TabbedView.Panels. The input SHALL be debounced (300 ms). When the debounced value changes, both tabs' queries SHALL reset to page 1 with the new search term as the `q` parameter.

#### Scenario: Search resets the list to page 1
- **WHEN** the user types into the search bar
- **THEN** after 300 ms debounce, the active tab's list refreshes from the beginning with the search term

#### Scenario: Clearing search restores the full list
- **WHEN** the user clears the search input
- **THEN** the active tab shows the full unfiltered list from page 1

---

### Requirement: Both tabs support infinite scroll load-more
Each tab SHALL use `ScrollablePage`'s `onLoadMore` / `hasMore` mechanism. `hasMore` is `true` when `meta.nextCursor !== null`. When the user scrolls to the bottom, the next page is appended.

#### Scenario: Load more appends next page
- **WHEN** the user scrolls to the bottom of a tab with more pages available
- **THEN** the next page of outlets is fetched and appended to the list

#### Scenario: Load more is not triggered when all items are loaded
- **WHEN** `meta.nextCursor` is `null`
- **THEN** no further fetch is triggered when the user reaches the bottom

---

### Requirement: OutletItem component renders outlet details
An `OutletItem` component SHALL display: avatar (image or initials fallback), outlet name, outlet code, address with a location icon, and contextual action area.

#### Scenario: OutletItem renders with imageUrl
- **WHEN** `OutletItem` receives an outlet with a non-null `imageUrl`
- **THEN** an `<img>` element is rendered with that URL as the source

#### Scenario: OutletItem renders initials fallback when no imageUrl
- **WHEN** `OutletItem` receives an outlet with a null or undefined `imageUrl`
- **THEN** the avatar area shows the outlet name's initials on a neutral background

#### Scenario: OutletItem renders code when present
- **WHEN** `OutletItem` receives an outlet with a non-null `code`
- **THEN** the code is displayed below the outlet name

---

### Requirement: Not-connected OutletItem shows membership-status-aware actions
When rendered in the Not Connected tab, `OutletItem` SHALL display actions based on `membershipStatus`:
- `PENDING`: an outlined **"Not My Outlet"** button (the reject action) and a filled **"Connect"** button (the confirm action)
- `REJECTED`: a plain **"Not My Outlet"** text label (non-interactive) and a filled **"Connect"** button only

The Connect button SHALL call `onConnect` when tapped. The "Not My Outlet" button (PENDING only) SHALL call `onReject` when tapped. Both callbacks are no-ops until wired to mutations.

#### Scenario: PENDING item shows reject button and connect button
- **WHEN** `OutletItem` is rendered with `connected={false}` and `membershipStatus="PENDING"`
- **THEN** an outlined "Not My Outlet" button and a filled "Connect" button are both visible

#### Scenario: REJECTED item shows label and connect button only
- **WHEN** `OutletItem` is rendered with `connected={false}` and `membershipStatus="REJECTED"`
- **THEN** a plain "Not My Outlet" text label is visible and only the "Connect" button is shown (no reject button)

#### Scenario: Connected item shows no action buttons
- **WHEN** `OutletItem` is rendered with `connected={true}`
- **THEN** neither the "Not My Outlet" label/button nor the Connect button are rendered

---

### Requirement: OutletListPage wires confirm and reject mutations
`OutletListPage` SHALL call `PATCH /outlets/:outletId/membership` when the user taps Connect (confirm) or "Not My Outlet" (reject) in the Not Connected tab. After a successful confirm, both the `connected=true` and `connected=false` query caches SHALL be invalidated. After a successful reject, the `connected=false` cache SHALL be invalidated so the item re-renders in REJECTED state.

#### Scenario: Tapping Connect confirms membership
- **WHEN** the user taps the Connect button on a PENDING or REJECTED outlet
- **THEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "confirm" }`
- **AND** on success, both `connected=true` and `connected=false` query caches are invalidated

#### Scenario: Tapping "Not My Outlet" rejects membership
- **WHEN** the user taps the "Not My Outlet" button on a PENDING outlet
- **THEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "reject" }`
- **AND** on success, the `connected=false` query cache is invalidated

#### Scenario: Confirmed outlet moves to Connected tab
- **WHEN** the confirm mutation succeeds and queries re-fetch
- **THEN** the outlet no longer appears in the Not Connected tab and appears in the Connected tab

#### Scenario: Rejected outlet remains in Not Connected with label only
- **WHEN** the reject mutation succeeds and the `connected=false` query re-fetches
- **THEN** the outlet remains in the Not Connected tab with `membershipStatus="REJECTED"` (label only, no reject button)

---

### Requirement: Single-outlet and empty-state behaviour is preserved
The existing auto-forward (1 outlet) and empty state (0 outlets) logic SHALL remain for the Connected tab. If the connected query returns exactly 1 outlet and no search term is active, auto-select and navigate to `/`. If 0 outlets, show empty state with logout.

#### Scenario: Single outlet auto-selects with no search term
- **WHEN** the connected query returns exactly 1 outlet and the search input is empty
- **THEN** that outlet is auto-selected and the user navigates to `/`

#### Scenario: Auto-forward is suppressed during search
- **WHEN** the connected query returns exactly 1 result but a search term is active
- **THEN** the result is shown in the list without auto-navigating

---

### Requirement: Both outlet tabs support pull-to-refresh
`OutletListPage` SHALL pass `onRefresh` and `isRefreshing` to both `TabbedView.Panel` components. `onRefresh` SHALL call the panel's corresponding TanStack Query `refetch` (`connectedQuery.refetch()` for the connected panel, `notConnectedQuery.refetch()` for the not-connected panel). `isRefreshing` SHALL be `true` when the query is fetching AND not fetching the next page (`isFetching && !isFetchingNextPage`), so the spinner appears during a full refresh but not during incremental load-more.

Since inactive panels are hidden via `display: none`, only the active tab's panel can receive touch or wheel events — "refresh active tab only" is enforced by layout without conditional prop logic.

#### Scenario: Pull-to-refresh triggers connected query refetch
- **WHEN** the Connected tab is active and the user completes a pull-to-refresh gesture
- **THEN** `connectedQuery.refetch()` is called and the connected outlet list refreshes from page 1

#### Scenario: Pull-to-refresh triggers not-connected query refetch
- **WHEN** the Not Connected tab is active and the user completes a pull-to-refresh gesture
- **THEN** `notConnectedQuery.refetch()` is called and the not-connected outlet list refreshes from page 1

#### Scenario: Refresh spinner shows during a full refresh
- **WHEN** a pull-to-refresh gesture has been triggered and the query is refetching
- **THEN** `isRefreshing` is `true` and the pull indicator shows a spinner

#### Scenario: Refresh spinner does not show during load-more
- **WHEN** the user scrolls to the bottom and a next-page fetch is in progress
- **THEN** `isRefreshing` is `false` (the refresh spinner is not visible; only the load-more spinner at the bottom is shown)

#### Scenario: Pull-to-refresh works when content is shorter than the viewport
- **WHEN** a tab has fewer outlets than the visible screen height
- **THEN** the user can still complete a pull-to-refresh gesture anywhere in the panel area and `onRefresh` is called
