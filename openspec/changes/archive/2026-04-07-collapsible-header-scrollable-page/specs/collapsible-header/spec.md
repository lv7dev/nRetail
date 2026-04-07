## ADDED Requirements

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
When the user scrolls the page content so that the card's full-height content exits the IntersectionObserver root, `CollapsibleHeader` SHALL switch the card to its collapsed (pill) state. The transition SHALL be animated with a CSS `max-height` and `opacity` transition.

#### Scenario: Scrolling down collapses the card
- **WHEN** the user scrolls the page content downward past the card's natural bottom edge
- **THEN** the card animates to a compact pill showing only the key summary content (e.g. outlet name)

#### Scenario: Scrolling back to top expands the card
- **WHEN** the user scrolls back toward the top so the sentinel re-enters the observed area
- **THEN** the card animates back to its full expanded state

---

### Requirement: The collapsed pill sticks just below the sub-header children
In the collapsed state, the card SHALL be `position: sticky` with `top` equal to the height of the `topBar` + `children` zone, so it presses against the bottom of the sub-header rather than scrolling away.

#### Scenario: Pill remains visible while content scrolls
- **WHEN** the card is collapsed and the user continues scrolling down
- **THEN** the pill stays fixed just below the SearchBar (or other children) while the page content scrolls beneath it

---

### Requirement: The card component controls its own pill appearance via a collapsed prop
`CollapsibleHeader` SHALL pass a `collapsed: boolean` prop down to whatever component is in the `card` slot, so the card component can render its own expanded vs. pill UI. The card is responsible for its own collapsed appearance.

#### Scenario: Card receives collapsed=false at page top
- **WHEN** the page is at the top (sentinel visible)
- **THEN** the card slot component receives `collapsed={false}`

#### Scenario: Card receives collapsed=true after scroll
- **WHEN** the user has scrolled past the card
- **THEN** the card slot component receives `collapsed={true}`
