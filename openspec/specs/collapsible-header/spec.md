## Requirements

### Requirement: CollapsibleHeader renders a fixed topBar, optional sub-header children, and a collapsible card
`CollapsibleHeader` SHALL render three zones stacked vertically: a `topBar` slot (always visible), a `children` slot (rendered inside the primary-colored background zone, e.g. SearchBar), and a `card` slot (the collapsible context card). All three are optional; the component renders gracefully when any slot is omitted.

#### Scenario: All three slots rendered
- **WHEN** `CollapsibleHeader` is rendered with `topBar`, `children`, and `card` props
- **THEN** the topBar appears at the top, children appear in the blue zone below it, and the card appears below the children overlapping the blue zone bottom edge

#### Scenario: Card slot omitted
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** the topBar and children render normally with no card area, no bottom radius class, and no overlap padding/margin styles

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

---

### Requirement: CollapsibleHeader accepts a configurable card overlap depth
`CollapsibleHeader` SHALL accept a `cardOverlap` prop (`number`, default `32`) that controls how many pixels the card peeks up into the topZone. The topZone SHALL use `paddingBottom: cardOverlap + 'px'` (inline style) and the card shell SHALL use `marginTop: -cardOverlap + 'px'` (inline style) so the values are always in sync. Inline styles are used instead of Tailwind arbitrary classes to avoid JIT purge in production.

#### Scenario: Default overlap depth
- **WHEN** `CollapsibleHeader` is rendered with a `card` prop and no `cardOverlap` prop
- **THEN** the topZone has `paddingBottom` of `32px` and the card shell has `marginTop` of `-32px`

#### Scenario: Custom overlap depth
- **WHEN** `CollapsibleHeader` is rendered with `card` and `cardOverlap={48}`
- **THEN** the topZone has `paddingBottom` of `48px` and the card shell has `marginTop` of `-48px`

#### Scenario: Overlap styles are absent when no card is provided
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** no `paddingBottom` inline style is applied to the topZone

---

### Requirement: CollapsibleHeader accepts a configurable card bottom radius
`CollapsibleHeader` SHALL accept a `cardRadius` prop (`string`, default `'rounded-b-3xl'`) that is applied as a Tailwind class to the topZone when a card is present. When no card is present, no radius class is applied. The value is a Tailwind `rounded-b-*` class string.

#### Scenario: Default radius
- **WHEN** `CollapsibleHeader` is rendered with a `card` prop and no `cardRadius` prop
- **THEN** the topZone has the `rounded-b-3xl` class

#### Scenario: Custom radius
- **WHEN** `CollapsibleHeader` is rendered with `card` and `cardRadius="rounded-b-xl"`
- **THEN** the topZone has the `rounded-b-xl` class and does not have `rounded-b-3xl`

#### Scenario: No radius class when card is absent
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** no `rounded-b-*` class is applied to the topZone

---

### Requirement: CollapsibleHeader accepts an optional className prop on the outer wrapper
`CollapsibleHeader` SHALL accept a `className?: string` prop and apply it via `cn()` to the outermost wrapper div, alongside `'relative'`. This allows callers to apply spacing, sizing, or other layout classes to the component root.

#### Scenario: className applied
- **WHEN** `CollapsibleHeader` is rendered with `className="pb-4"`
- **THEN** the outermost div has both `relative` and `pb-4` classes
