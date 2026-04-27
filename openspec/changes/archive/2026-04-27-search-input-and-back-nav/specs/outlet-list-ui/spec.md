## ADDED Requirements

### Requirement: Back arrow appears only when navigated from within the app via explicit intent
`OutletListPage` SHALL show the back arrow only when `location.state?.canGoBack` is truthy. This replaces the previous `location.key !== 'default'` check. The `OutletGuard` redirect (`<Navigate replace />`) never carries this state, so the back arrow is hidden on first app open. Any in-app navigation that pushes to `/outlets` with intent to allow going back MUST pass `{ state: { canGoBack: true } }`.

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

## MODIFIED Requirements

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
