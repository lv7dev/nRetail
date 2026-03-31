## ADDED Requirements

### Requirement: BottomNav icon and label colors use semantic tokens
The BottomNav component SHALL use Tailwind semantic token classes for active/inactive tab colors instead of hardcoded hex values. Color classes SHALL support `dark:` variants so that inactive tabs are appropriately lighter in dark mode.

#### Scenario: Active tab uses primary color in both modes
- **WHEN** a BottomNav tab is the active route
- **THEN** the tab button has `text-primary` class applied
- **AND** the icon and label render in the primary color in both light and dark mode

#### Scenario: Inactive tab is muted in light mode
- **WHEN** a BottomNav tab is not the active route
- **AND** the `dark` class is NOT on `<html>`
- **THEN** the tab button renders with `text-content-muted` color

#### Scenario: Inactive tab is lighter in dark mode
- **WHEN** a BottomNav tab is not the active route
- **AND** the `dark` class is on `<html>`
- **THEN** the tab button renders with `text-content-dark-muted` color (visibly lighter than black)

#### Scenario: No inline style color overrides remain
- **WHEN** inspecting the rendered BottomNav DOM
- **THEN** no `style` attribute contains a `color` property on tab buttons
