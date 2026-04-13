## Why

`CollapsibleHeader` has two correctness issues found during a card overlay UI adjustment: card-specific styles are applied unconditionally even when no card is present, and `position: sticky` + its supporting `stickyTop` state are dead code because the component sits outside the scroll container where sticky can never activate.

## What Changes

- **Guard `pb-8 rounded-b-3xl` on topZone** behind `renderedCard !== null` — these styles only make sense when a card is present to fill the overlap gap. Without a card, they produce unwanted empty space and rounded corners.
- **Remove `sticky` class** from the collapsed card shell — `CollapsibleHeader` lives outside `ScrollablePage` (the scroll container), so sticky never activates. The collapse visual state is driven by the `collapsed` prop, not CSS positioning.
- **Remove `stickyTop` state, ResizeObserver effect, and `style={{ top }}` prop** — all computed to support the non-functioning sticky. Dead code.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `collapsible-header`: Remove the sticky-positioning requirement (Requirement 3 — "The collapsed pill sticks just below the sub-header children"). The component sits outside the scroll container; sticky cannot activate. Collapse appearance is driven by the `collapsed` prop on the card component, not CSS sticky. Also add a requirement that card-specific layout styles (bottom padding, rounded corners) are absent when no card is provided.

## Impact

- `miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx` — implementation change only, public API unchanged
- `openspec/specs/collapsible-header/spec.md` — Requirement 3 removed, new requirement added for card-conditional styles
- No consumer API changes; the `collapsed` prop contract and `card` slot behavior are unchanged
