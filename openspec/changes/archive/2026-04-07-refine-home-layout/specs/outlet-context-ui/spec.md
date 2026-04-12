## REMOVED Requirements

### Requirement: AppLayout header displays the current outlet name
**Reason**: Replaced by outlet switcher in `QuickActionsGrid`. The AppLayout header overlay was redundant with the outlet card on the Home page and cluttered every authenticated screen.
**Migration**: Remove the `div.absolute` header from `AppLayout`. The outlet name and navigation are now exclusively handled by the `QuickActionsGrid` header row on the Home page.

### Requirement: Tapping the outlet name in the header navigates to the outlet picker
**Reason**: Behaviour is preserved but moved to `QuickActionsGrid`. AppLayout no longer manages this interaction.
**Migration**: The same navigation to `/outlets` on tap is implemented in `QuickActionsGrid`'s outlet header button.

## ADDED Requirements

### Requirement: QuickActionsGrid header is the outlet switcher on Home page
The top row of `QuickActionsGrid` SHALL be a full-width tappable button that displays the selected outlet's name. A `chevron-right` icon SHALL be shown on the right as a visual affordance. Tapping navigates to `/outlets`. The current outlet is NOT cleared on tap — it remains selected until the user explicitly picks a new one.

#### Scenario: Outlet name row is tappable
- **WHEN** the user taps the outlet name row in `QuickActionsGrid`
- **THEN** the app SHALL navigate to `/outlets`

#### Scenario: Chevron signals navigability
- **WHEN** `QuickActionsGrid` is rendered
- **THEN** a `chevron-right` icon SHALL be visible on the right side of the outlet header row

#### Scenario: Navigating back without picking preserves current outlet
- **WHEN** the user taps the outlet row, views the outlet list, and navigates back without selecting
- **THEN** the previously selected outlet SHALL still be active

### Requirement: AppLayout contains no outlet switcher
`AppLayout` SHALL NOT render any outlet name, outlet button, or navigation control related to outlet selection. It SHALL only render the page content outlet and `BottomNav`.

#### Scenario: No outlet button in AppLayout
- **WHEN** any authenticated app page is rendered via `AppLayout`
- **THEN** `AppLayout` SHALL NOT contain a button or element displaying the outlet name
