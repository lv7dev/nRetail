## ADDED Requirements

### Requirement: TabBar supports an on-primary variant for use on coloured backgrounds
`TabBar` SHALL accept an optional `variant` prop with values `"default"` (existing behaviour) and `"on-primary"`. When `variant="on-primary"`, active tab styling SHALL be `bg-white text-primary` and inactive tab styling SHALL be `bg-transparent text-white/80` (no border). When `variant` is omitted or `"default"`, existing styling applies unchanged.

#### Scenario: on-primary active tab has white background and primary text
- **WHEN** `TabBar` is rendered with `variant="on-primary"` and `activeTab="connected"`
- **THEN** the "connected" button has `bg-white` and `text-primary` classes applied

#### Scenario: on-primary inactive tabs have transparent background and white text
- **WHEN** `TabBar` is rendered with `variant="on-primary"` and `activeTab="connected"`
- **THEN** all non-active buttons have no border, no coloured background, and `text-white/80` class applied

#### Scenario: default variant is unaffected
- **WHEN** `TabBar` is rendered without a `variant` prop (or with `variant="default"`)
- **THEN** active tab has `bg-primary text-content-inverse` and inactive tabs have `border border-border text-content-muted` (existing behaviour unchanged)

---

### Requirement: TabbedViewTabBar forwards variant to TabBar
`TabbedViewTabBar` SHALL accept an optional `variant` prop and forward it to the underlying `TabBar` component.

#### Scenario: variant prop is forwarded
- **WHEN** `TabbedView.TabBar` is rendered with `variant="on-primary"`
- **THEN** the underlying `TabBar` receives `variant="on-primary"` and renders on-primary styling
