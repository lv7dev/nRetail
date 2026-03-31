## ADDED Requirements

### Requirement: Icon fill inherits from CSS color property
The `Icon` component SHALL render SVG icons with `fill="currentColor"` so that icon fill color is driven by the CSS `color` property of the component or its parent. Icons SHALL NOT default to black.

#### Scenario: Icon inherits light text color in dark mode
- **WHEN** an `<Icon>` is rendered inside an element with a light text color class (e.g., `text-content-dark-muted`)
- **AND** the `dark` class is on `<html>`
- **THEN** the icon fills with the light color, not black

#### Scenario: Icon inherits active primary color
- **WHEN** an `<Icon>` is rendered inside an element with `text-primary`
- **THEN** the icon fills with the primary color

#### Scenario: Icon inherits muted color in light mode
- **WHEN** an `<Icon>` is rendered inside an element with `text-content-muted`
- **AND** the `dark` class is NOT on `<html>`
- **THEN** the icon fills with the muted content color
