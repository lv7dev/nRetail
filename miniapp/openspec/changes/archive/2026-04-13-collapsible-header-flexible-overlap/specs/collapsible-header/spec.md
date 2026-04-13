## ADDED Requirements

### Requirement: CollapsibleHeader accepts a configurable card overlap depth
`CollapsibleHeader` SHALL accept a `cardOverlap` prop (`number`, default `32`) that controls how many pixels the card peeks up into the topZone. The topZone SHALL use `paddingBottom: cardOverlap + 'px'` and the card shell SHALL use `marginTop: -cardOverlap + 'px'` so the values are always in sync.

#### Scenario: Default overlap depth matches previous hardcoded behavior
- **WHEN** `CollapsibleHeader` is rendered with a `card` prop and no `cardOverlap` prop
- **THEN** the topZone has `paddingBottom` of `32px` and the card shell has `marginTop` of `-32px`

#### Scenario: Custom overlap depth is applied to both topZone and card shell
- **WHEN** `CollapsibleHeader` is rendered with `card` and `cardOverlap={48}`
- **THEN** the topZone has `paddingBottom` of `48px` and the card shell has `marginTop` of `-48px`

#### Scenario: Overlap styles are absent when no card is provided
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** no `paddingBottom` inline style is applied to the topZone and no `marginTop` inline style is applied to the card shell

### Requirement: CollapsibleHeader accepts a configurable card bottom radius
`CollapsibleHeader` SHALL accept a `cardRadius` prop (`string`, default `'rounded-b-3xl'`) that is applied as a Tailwind class to the topZone when a card is present. When no card is present, no radius class is applied.

#### Scenario: Default radius matches previous hardcoded behavior
- **WHEN** `CollapsibleHeader` is rendered with a `card` prop and no `cardRadius` prop
- **THEN** the topZone has the `rounded-b-3xl` class

#### Scenario: Custom radius is applied when provided
- **WHEN** `CollapsibleHeader` is rendered with `card` and `cardRadius="rounded-b-xl"`
- **THEN** the topZone has the `rounded-b-xl` class and does not have `rounded-b-3xl`

#### Scenario: No radius class when card is absent
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** the topZone has neither `rounded-b-3xl` nor any `cardRadius` class applied
