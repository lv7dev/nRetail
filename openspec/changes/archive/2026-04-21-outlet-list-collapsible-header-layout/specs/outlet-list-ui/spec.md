## MODIFIED Requirements

### Requirement: OutletListPage layout uses CollapsibleHeader with TabBar in the header zone
`OutletListPage` SHALL use `CollapsibleHeader` as the top-of-page header. The `topBar` slot SHALL contain the back arrow (when `canGoBack`) and the page title. The `children` slot SHALL contain `TabbedView.TabBar` rendered with `variant="on-primary"`. No `card` prop is used. The search `Input` SHALL be rendered in the white content zone immediately below `CollapsibleHeader`, outside `TabbedView.Panels`, so it remains visible while the list scrolls.

#### Scenario: TabBar appears inside the red header zone
- **WHEN** `OutletListPage` renders
- **THEN** `TabbedView.TabBar` is a descendant of `CollapsibleHeader`'s children slot (inside the red bg zone), not inside the white content card

#### Scenario: Search bar appears in the white content zone below the header
- **WHEN** `OutletListPage` renders
- **THEN** the search `Input` is rendered below `CollapsibleHeader` and above `TabbedView.Panels`, in a white/background-coloured area

#### Scenario: Search bar is always visible while the list scrolls
- **WHEN** the user scrolls the outlet list
- **THEN** the search bar remains visible (it is outside the scroll container)

#### Scenario: TabbedView wraps CollapsibleHeader and Panels
- **WHEN** `OutletListPage` renders
- **THEN** both `CollapsibleHeader` (containing `TabbedView.TabBar`) and `TabbedView.Panels` are descendants of the same `TabbedView` root

---

### Requirement: Search bar filters both tabs server-side
`OutletListPage` SHALL render a search input above the `TabbedView.Panels`. The input SHALL be debounced (300 ms). When the debounced value changes, both tabs' queries SHALL reset to page 1 with the new search term as the `q` parameter.

#### Scenario: Search resets the list to page 1
- **WHEN** the user types into the search bar
- **THEN** after 300 ms debounce, the active tab's list refreshes from the beginning with the search term

#### Scenario: Clearing search restores the full list
- **WHEN** the user clears the search input
- **THEN** the active tab shows the full unfiltered list from page 1
