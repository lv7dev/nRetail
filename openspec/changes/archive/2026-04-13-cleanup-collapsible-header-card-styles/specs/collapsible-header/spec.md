## ADDED Requirements

### Requirement: CollapsibleHeader omits card-overlap layout styles when no card is present
When the `card` prop is omitted, the topZone SHALL render without the bottom padding and rounded-bottom-corner styles that exist solely to create the card overlap effect. The primary background color SHALL always be applied regardless of whether a card is present.

#### Scenario: No card prop — flat header bottom edge
- **WHEN** `CollapsibleHeader` is rendered without a `card` prop
- **THEN** the topZone has no extra bottom padding and no rounded bottom corners

#### Scenario: Card prop present — overlap styles applied
- **WHEN** `CollapsibleHeader` is rendered with a `card` prop
- **THEN** the topZone renders with bottom padding and rounded bottom corners to create the card overlap effect

## REMOVED Requirements

### Requirement: The collapsed pill sticks just below the sub-header children
**Reason**: `CollapsibleHeader` sits outside the `ScrollablePage` scroll container in the page layout. CSS `position: sticky` only activates when the element is a descendant of the scroll container. The component is never in that position, so sticky never fires. The visual "stuck" appearance when collapsed is achieved entirely by the `collapsed` prop passed to the card component — no CSS sticky is needed or possible in this architecture.
**Migration**: No consumer migration needed. The `collapsed` prop contract and card component appearance are unchanged. The `stickyTop` state and ResizeObserver were internal implementation details with no external API.
