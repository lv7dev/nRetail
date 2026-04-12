## ADDED Requirements

### Requirement: CollapsibleHeader accepts an optional decoration prop for background visuals
`CollapsibleHeader` SHALL accept an optional `decoration?: ReactNode` prop. When provided, the node SHALL be rendered as an absolutely-positioned element inside the primary-colored topBar/children zone, behind all other content (`z-0`). Interactive elements (topBar, children) SHALL render above the decoration (`z-10` relative).

#### Scenario: Decoration provided
- **WHEN** `CollapsibleHeader` receives a `decoration` prop
- **THEN** the decoration node is rendered inside the bg zone and visible behind topBar and children

#### Scenario: Decoration omitted
- **WHEN** `CollapsibleHeader` receives no `decoration` prop
- **THEN** the bg zone renders as a flat solid primary color with no additional elements
