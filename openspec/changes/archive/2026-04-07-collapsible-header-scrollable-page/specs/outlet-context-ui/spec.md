## MODIFIED Requirements

### Requirement: Outlet context is displayed in a dedicated OutletContextCard component on the home page
The outlet name and quick actions SHALL be rendered in a standalone `OutletContextCard` component (extracted from `QuickActionsGrid`) that accepts a `collapsed?: boolean` prop. When `collapsed={false}` (default), it shows the outlet name row and the 4 quick action buttons. When `collapsed={true}`, it renders as a compact pill showing only the outlet name and a chevron. Tapping the outlet name in either state navigates to `/outlets`.

#### Scenario: Expanded state shows outlet name and quick actions
- **WHEN** `OutletContextCard` is rendered with `collapsed={false}` (or without the prop)
- **THEN** the outlet name row and all 4 quick action buttons are visible

#### Scenario: Collapsed state shows pill with outlet name only
- **WHEN** `OutletContextCard` is rendered with `collapsed={true}`
- **THEN** only the outlet name and a chevron icon are visible; the action buttons are hidden

#### Scenario: Tapping outlet name in expanded state navigates to outlet picker
- **WHEN** the user taps the outlet name row in the expanded state
- **THEN** the app navigates to `/outlets`

#### Scenario: Tapping outlet name in collapsed (pill) state navigates to outlet picker
- **WHEN** the user taps the pill in the collapsed state
- **THEN** the app navigates to `/outlets`

#### Scenario: Navigating back without picking preserves current outlet
- **WHEN** the user taps the outlet name, views the outlet list, and navigates back without selecting
- **THEN** the previously selected outlet is still active

---

## REMOVED Requirements

### Requirement: AppLayout header displays the current outlet name
**Reason:** The `refine-home-layout` change moved the outlet name from `AppLayout` into `QuickActionsGrid`. This change completes that migration by extracting it into `OutletContextCard`, slotted into `CollapsibleHeader` on the home page. `AppLayout` is not involved in outlet display.
**Migration:** Outlet context is now displayed via `OutletContextCard` inside `CollapsibleHeader` on the home page only. Other pages do not show the outlet name in a header card.
