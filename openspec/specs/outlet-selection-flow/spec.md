## ADDED Requirements

### Requirement: Outlet picker is required before accessing app features
The app SHALL require an outlet to be selected before rendering any protected app routes. An `OutletGuard` component SHALL sit between `ProtectedRoute` and `AppLayout` in the route tree. If no outlet is selected, the user is redirected to `/outlets`.

#### Scenario: Authenticated user with no selected outlet is redirected
- **WHEN** an authenticated user navigates to `/` with no outlet in `useOutletStore`
- **THEN** the app redirects to `/outlets`

#### Scenario: Authenticated user with selected outlet accesses the app
- **WHEN** an authenticated user navigates to `/` with an outlet in `useOutletStore`
- **THEN** the app renders the requested page normally

#### Scenario: Unauthenticated user is not shown the outlet picker
- **WHEN** an unauthenticated user navigates to `/outlets`
- **THEN** `ProtectedRoute` redirects them to `/login` before `OutletListPage` renders

---

### Requirement: Outlet list page shows the user's assigned outlets
`OutletListPage` at `/outlets` SHALL fetch the user's connected outlets via `outletService.getOutlets({ connected: true })` and display them in the Connected tab of a `TabbedView`. Each outlet SHALL be rendered as an `OutletItem`. Tapping an outlet selects it via `useOutletStore.setSelectedOutlet` and navigates to `/`.

#### Scenario: User sees their outlets listed in the Connected tab
- **WHEN** `OutletListPage` renders for a user with multiple outlets
- **THEN** each outlet name is visible in the Connected tab

#### Scenario: Tapping an outlet selects it and navigates to home
- **WHEN** the user taps an outlet in the Connected tab
- **THEN** `useOutletStore.setSelectedOutlet` is called with that outlet and the app navigates to `/`

---

### Requirement: Single-outlet user is auto-forwarded without seeing the picker
If `outletService.getOutlets({ connected: true })` returns exactly one outlet **and** the search input is empty, `OutletListPage` SHALL auto-select it and navigate to `/` without displaying the list UI.

#### Scenario: User with one outlet is auto-forwarded when search is empty
- **WHEN** `OutletListPage` mounts, the connected query returns exactly 1 outlet, and no search term is active
- **THEN** that outlet is selected and the user is navigated to `/` without any list being shown

#### Scenario: Auto-forward is suppressed when search is active
- **WHEN** the connected query returns exactly 1 result but the search input has a value
- **THEN** the outlet is shown in the list; auto-navigation does not occur

---

### Requirement: Empty state for users with no outlet assignments
If `outletService.getOutlets({ connected: true })` returns an empty list **and** the search input is empty, `OutletListPage` SHALL show an informative empty state with a logout button.

#### Scenario: User with zero outlets sees empty state when not searching
- **WHEN** `OutletListPage` mounts, the connected query returns an empty list, and the search input is empty
- **THEN** an empty state message is displayed and a logout button is visible

#### Scenario: Empty search results do not trigger empty state
- **WHEN** the connected query returns an empty list but a search term is active
- **THEN** the UI shows a "no results" message instead of the empty state with logout button

#### Scenario: Logout button on empty state clears session
- **WHEN** the user taps the logout button on the empty state
- **THEN** `clearAuth()` is called and the user is navigated to `/login`

---

### Requirement: Back arrow on OutletListPage is conditional on navigation history
`OutletListPage` SHALL show a back arrow only when there is a prior route in the React Router history stack (`location.key !== 'default'`). Tapping it SHALL call `navigate(-1)`. When the user arrives on `/outlets` directly (first login, no prior navigation), no back arrow is shown.

#### Scenario: No back arrow on first login
- **WHEN** the user lands on `/outlets` as the first navigation after app boot (`location.key === 'default'`)
- **THEN** no back arrow is rendered

#### Scenario: Back arrow appears when navigating from home
- **WHEN** the user taps the outlet selector on the home page and is pushed to `/outlets`
- **THEN** a back arrow is visible in the header

#### Scenario: Back arrow navigates to previous page
- **WHEN** the user taps the back arrow on `/outlets`
- **THEN** `navigate(-1)` is called, returning them to the previous route

---

### Requirement: Selected outlet persists across app restarts
The selected outlet SHALL be stored in `localStorage` via Zustand `persist` middleware so that it survives page reloads and app restarts.

#### Scenario: Selected outlet survives page reload
- **WHEN** the user selects an outlet and then reloads the app
- **THEN** the previously selected outlet is still in `useOutletStore` and `OutletGuard` lets them through

#### Scenario: Selected outlet is cleared on logout
- **WHEN** the user logs out (via any logout action that calls `clearAuth()`)
- **THEN** `useOutletStore.selectedOutlet` is set to `null` and the persisted value is removed from `localStorage`

#### Scenario: User must re-select after logout and re-login
- **WHEN** the user logs out and logs back in
- **THEN** no outlet is pre-selected and the user is redirected to `/outlets`
