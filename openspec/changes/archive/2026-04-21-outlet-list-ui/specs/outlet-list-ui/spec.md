## ADDED Requirements

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
`OutletListPage` SHALL render a search input above the tab bar. The input SHALL be debounced (300 ms). When the debounced value changes, both tabs' queries SHALL reset to page 1 with the new search term as the `q` parameter.

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

### Requirement: Not-connected OutletItem shows informational label and Connect button
When rendered in the Not connected tab, `OutletItem` SHALL display a "Not My Outlet" informational label and a **Connect** button. The Connect button is rendered but performs no action until the backend API is available.

#### Scenario: Not-connected item shows label and button
- **WHEN** `OutletItem` is rendered with `connected={false}`
- **THEN** the "Not My Outlet" label and Connect button are visible

#### Scenario: Connected item shows no action buttons
- **WHEN** `OutletItem` is rendered with `connected={true}`
- **THEN** neither the "Not My Outlet" label nor the Connect button are rendered

---

### Requirement: Single-outlet and empty-state behaviour is preserved
The existing auto-forward (1 outlet) and empty state (0 outlets) logic SHALL remain for the Connected tab. If the connected query returns exactly 1 outlet and no search term is active, auto-select and navigate to `/`. If 0 outlets, show empty state with logout.

#### Scenario: Single outlet auto-selects with no search term
- **WHEN** the connected query returns exactly 1 outlet and the search input is empty
- **THEN** that outlet is auto-selected and the user navigates to `/`

#### Scenario: Auto-forward is suppressed during search
- **WHEN** the connected query returns exactly 1 result but a search term is active
- **THEN** the result is shown in the list without auto-navigating
