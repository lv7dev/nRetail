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
`OutletListPage` at `/outlets` SHALL fetch `GET /outlets/mine` and display the result. Each outlet SHALL be shown as a tappable list item. Tapping an outlet selects it and navigates to `/`.

#### Scenario: User sees their outlets listed
- **WHEN** `OutletListPage` renders for a user with multiple outlets
- **THEN** each outlet name is visible on screen

#### Scenario: Tapping an outlet selects it and navigates to home
- **WHEN** the user taps an outlet in the list
- **THEN** `useOutletStore.setSelectedOutlet` is called with that outlet and the app navigates to `/`

---

### Requirement: Single-outlet user is auto-forwarded without seeing the picker
If `GET /outlets/mine` returns exactly one outlet, `OutletListPage` SHALL auto-select it and navigate to `/` without displaying the list UI.

#### Scenario: User with one outlet is auto-forwarded
- **WHEN** `OutletListPage` mounts and `/outlets/mine` returns exactly 1 outlet
- **THEN** that outlet is selected and the user is navigated to `/` without any list being shown

---

### Requirement: Empty state for users with no outlet assignments
If `GET /outlets/mine` returns an empty list, `OutletListPage` SHALL show an informative empty state with a logout button. No app features are accessible.

#### Scenario: User with zero outlets sees empty state
- **WHEN** `OutletListPage` mounts and `/outlets/mine` returns an empty list
- **THEN** an empty state message is displayed and a logout button is visible

#### Scenario: Logout button on empty state clears session
- **WHEN** the user taps the logout button on the empty state
- **THEN** `clearAuth()` is called (which also clears any selected outlet) and the user is navigated to `/login`

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
