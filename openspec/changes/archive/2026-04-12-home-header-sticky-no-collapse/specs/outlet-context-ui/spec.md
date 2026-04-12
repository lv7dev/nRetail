## MODIFIED Requirements

### Requirement: Outlet context is displayed in a dedicated OutletContextCard component on the home page
The outlet name and quick actions SHALL be rendered in a standalone `OutletContextCard` component that accepts a `collapsed?: boolean` prop. When `collapsed={false}` (default), it shows the outlet name row and the 4 quick action buttons. When `collapsed={true}`, the quick-actions grid animates to zero height via CSS `grid-template-rows` transition (200ms ease-in-out) — the outlet name row and chevron remain visible. The quick-actions DOM stays mounted in both states (required for CSS animation). Tapping the outlet name in either state navigates to `/outlets`. On the home page, `collapsed` is driven by `ScrollablePage.onCollapsedChange` → `HomePage` state → `CollapsibleHeader` controlled prop.

#### Scenario: Expanded state shows outlet name and quick actions
- **WHEN** `OutletContextCard` is rendered with `collapsed={false}` (or without the prop)
- **THEN** the outlet name row and all 4 quick action buttons are visible
- **AND** the grid wrapper has `grid-template-rows: 1fr`

#### Scenario: Collapsed state hides quick actions with animation
- **WHEN** `OutletContextCard` is rendered with `collapsed={true}`
- **THEN** the outlet name and chevron icon remain visible
- **AND** the quick-actions grid animates to zero height (`grid-template-rows: 0fr`)
- **AND** `overflow-hidden` on the inner wrapper prevents content from leaking during animation

#### Scenario: Collapse transition is smooth
- **WHEN** `collapsed` transitions from `false` to `true` (or vice versa)
- **THEN** the quick-actions grid height animates over 200ms with ease-in-out timing

#### Scenario: Tapping outlet name in expanded state navigates to outlet picker
- **WHEN** the user taps the outlet name row in the expanded state
- **THEN** the app navigates to `/outlets`

#### Scenario: Tapping outlet name in collapsed (pill) state navigates to outlet picker
- **WHEN** the user taps the pill in the collapsed state
- **THEN** the app navigates to `/outlets`

#### Scenario: Navigating back without picking preserves current outlet
- **WHEN** the user taps the outlet name, views the outlet list, and navigates back without selecting
- **THEN** the previously selected outlet is still active

#### Scenario: Home page collapses OutletContextCard on scroll
- **WHEN** the user scrolls the home page content downward (scrollTop > 0)
- **THEN** the OutletContextCard collapses — quick-actions grid animates to zero height, card sticks below the top bar

#### Scenario: Home page re-expands OutletContextCard when scrolled back to top
- **WHEN** the user scrolls back to the top (scrollTop === 0)
- **THEN** the OutletContextCard re-expands — quick-actions grid animates back to full height
