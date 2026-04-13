## Why

`CollapsibleHeader` hardcodes the card overlap depth (`pb-8` / `mt-[-32px]` = 32px) and the bottom corner radius (`rounded-b-3xl`) as fixed Tailwind classes. As the component is adopted on more pages (for its safe-area handling and decoration support), callers need to control these values. The component also violates the project convention of always using `cn()` for class composition.

## What Changes

- **Add `cardOverlap` prop** (`number`, default `32`) — controls how many pixels the card peeks up into the header zone. Replaces the hardcoded `pb-8` / `mt-[-32px]` pair with inline styles so the value can be any pixel amount, not just Tailwind scale steps.
- **Add `cardRadius` prop** (`string`, default `'rounded-b-3xl'`) — controls the bottom corner radius of the topZone when a card is present. Accepts a Tailwind class string so callers can use any `rounded-b-*` value.
- **Switch to `cn()` for class composition** — remove the template literal string concatenation on `topZone` className; use `cn()` from `@/utils/cn` throughout, consistent with every other component in the project.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `collapsible-header`: `cardOverlap` and `cardRadius` props added — the card overlap depth and bottom radius are now caller-controlled with sensible defaults, not hardcoded.

## Impact

- `miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx` — prop interface and render logic
- `miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.test.tsx` — tests for new props and defaults
- `openspec/specs/collapsible-header/spec.md` — requirement update for configurable overlap
- No breaking changes: both props have defaults matching the current behavior
