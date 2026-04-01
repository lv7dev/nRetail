## ADDED Requirements

### Requirement: AppLayout header displays the current outlet name
`AppLayout` SHALL show the selected outlet's name in the header. This gives users constant visibility of which outlet they are operating in.

#### Scenario: Outlet name is visible in the app header
- **WHEN** a user has selected an outlet and is on any app page (home, products, etc.)
- **THEN** the outlet name is displayed in the AppLayout header

---

### Requirement: Tapping the outlet name in the header navigates to the outlet picker
The outlet name in the header SHALL be a tappable control. Tapping it navigates to `/outlets` so the user can switch to a different outlet. The current outlet is NOT cleared on tap — it remains selected until the user explicitly picks a new one.

#### Scenario: Tapping outlet name goes to outlet picker
- **WHEN** the user taps the outlet name in the AppLayout header
- **THEN** the app navigates to `/outlets`

#### Scenario: Navigating back without picking preserves current outlet
- **WHEN** the user taps the outlet name, views the outlet list, and navigates back without selecting
- **THEN** the previously selected outlet is still active and `OutletGuard` lets them through

#### Scenario: Picking a different outlet from the header updates context
- **WHEN** the user taps the outlet name, then taps a different outlet in the list
- **THEN** `useOutletStore.selectedOutlet` is updated to the new outlet and the user is navigated to `/`
