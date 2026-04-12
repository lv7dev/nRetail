## Requirements

### Requirement: CollapsibleHeader renders a fixed topBar, optional sub-header children, and a collapsible card
`CollapsibleHeader` SHALL render three zones stacked vertically: a `topBar` slot (always visible), a `children` slot (rendered inside the primary-colored background zone, e.g. SearchBar), and a `card` slot (the collapsible context card). All three are optional; the component renders gracefully when any slot is omitted.

#### Scenario: All three slots rendered
- **WHEN** `CollapsibleHeader` is rendered with `topBar`, `children`, and `card` props
- **THEN** the topBar appears at the top, children appear in the blue zone below it, and the card appears below the children overlapping the blue zone bottom edge

#### Scenario: Card slot omitted
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** the topBar and children render normally with no card area

---

### Requirement: The card collapses to a pill when the user scrolls past it
`CollapsibleHeader` supports two modes: **controlled** (`collapsed` prop provided) and **uncontrolled** (internal IntersectionObserver on sentinel). In controlled mode, the parent page drives the collapse state — recommended when `ScrollablePage` is the scroll container, since the sentinel lives outside the scroll container and the uncontrolled IntersectionObserver may not fire correctly. In uncontrolled mode, the internal `collapsed` state starts as `false` (expanded).

#### Scenario: Scrolling down collapses the card (controlled mode)
- **WHEN** `ScrollablePage` reports `onCollapsedChange(true)` and the parent passes `collapsed={true}`
- **THEN** the card transitions to its collapsed (pill) state

#### Scenario: Scrolling back to top expands the card (controlled mode)
- **WHEN** `ScrollablePage` reports `onCollapsedChange(false)` and the parent passes `collapsed={false}`
- **THEN** the card transitions back to its full expanded state

#### Scenario: Uncontrolled mode via IntersectionObserver
- **WHEN** no `collapsed` prop is provided and the sentinel exits the IntersectionObserver root
- **THEN** the card transitions to its collapsed state internally

---

### Requirement: The collapsed pill sticks just below the sub-header children
In the collapsed state, the card SHALL be `position: sticky` with `top` equal to the height of the `topBar` + `children` zone, so it presses against the bottom of the sub-header rather than scrolling away.

#### Scenario: Pill remains visible while content scrolls
- **WHEN** the card is collapsed and the user continues scrolling down
- **THEN** the pill stays fixed just below the SearchBar (or other children) while the page content scrolls beneath it

---

### Requirement: The card component controls its own pill appearance via a collapsed prop
`CollapsibleHeader` SHALL pass a `collapsed: boolean` prop down to whatever component is in the `card` slot via `cloneElement`, so the card component can render its own expanded vs. pill UI. The card is responsible for its own collapsed appearance.

#### Scenario: Card receives collapsed=false at page top
- **WHEN** the page is at the top (sentinel visible)
- **THEN** the card slot component receives `collapsed={false}`

#### Scenario: Card receives collapsed=true after scroll
- **WHEN** the user has scrolled past the card
- **THEN** the card slot component receives `collapsed={true}`

---

### Requirement: CollapsibleHeader accepts an optional decoration prop for background visuals
`CollapsibleHeader` SHALL accept an optional `decoration?: ReactNode` prop. When provided, the node SHALL be rendered as an absolutely-positioned element inside the primary-colored topBar/children zone, behind all other content (`z-0`). Interactive elements (topBar, children) SHALL render above the decoration (`z-10` relative).

#### Scenario: Decoration provided
- **WHEN** `CollapsibleHeader` receives a `decoration` prop
- **THEN** the decoration node is rendered inside the bg zone and visible behind topBar and children

#### Scenario: Decoration omitted
- **WHEN** `CollapsibleHeader` receives no `decoration` prop
- **THEN** the bg zone renders as a flat solid primary color with no additional elements
