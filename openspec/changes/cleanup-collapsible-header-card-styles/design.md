## Context

`CollapsibleHeader` is a shared component used on the home page. It renders a primary-colored header zone with an optional card that overlaps its bottom edge. The card collapses to a pill when the user scrolls. The component is driven by a controlled `collapsed` prop from `ScrollablePage` via `onCollapsedChange`.

Current state has two issues:
1. `pb-8 rounded-b-3xl` are hard-coded onto the `topZoneRef` div, applied even when no card is present.
2. The card shell uses `position: sticky` with a `stickyTop` value (height of topZone) when collapsed. This never activates because `CollapsibleHeader` sits above `ScrollablePage` in the layout — it is not a descendant of the scroll container.

## Goals / Non-Goals

**Goals:**
- Remove dead `sticky`, `stickyTop` state, ResizeObserver effect, and inline `style={{ top }}` from the card shell
- Guard `pb-8 rounded-b-3xl` on topZone so they only render when a card is present

**Non-Goals:**
- Changing the `collapsed` prop contract or `card` slot API
- Redesigning the collapse mechanism or scroll detection
- Modifying `OutletContextCard` or any card slot consumers

## Decisions

### Decision: Guard `pb-8 rounded-b-3xl` with `renderedCard !== null`

Move the card-overlap styles from a fixed class string to a conditional expression computed from `renderedCard`. `bg-primary` stays unconditional — it is always needed for the header background.

```
topZone className: "relative overflow-hidden bg-primary" + (renderedCard ? " pb-8 rounded-b-3xl" : "")
```

**Alternative considered**: Accept an `overlap` or `cardVariant` prop to give callers control. Rejected — adds API surface for what is currently a single consistent design. The conditional is sufficient; callers that don't pass a card simply get the flat header they expect.

### Decision: Replace `sticky` with `relative` on the card shell in both states

Both collapsed and expanded states use `relative`. This is consistent with how the component actually works: the card is always positioned in normal flow below the header, and its visual appearance (pill vs. full card) is controlled by the `collapsed` prop passed to the card component.

**Alternative considered**: Keep `sticky` and rely on the fact that it silently does nothing. Rejected — dead CSS is misleading and makes future layout work harder to reason about.

### Decision: Remove `stickyTop` state + ResizeObserver entirely

The ResizeObserver on `topZoneRef` exists solely to feed `stickyTop`, which feeds `style={{ top }}` on the sticky card shell. With sticky removed, the entire chain is dead. Delete all three: the state initializer, the effect, and the inline style prop.

## Risks / Trade-offs

- **Risk**: A future design requirement reintroduces sticky-style pinning for the card. → Mitigation: The spec and this design document the decision. If sticky is needed, the correct approach is to restructure the layout so the card lives inside the scroll container, or use a different mechanism (e.g., fixed positioning). The ResizeObserver can be reintroduced at that point.
- **Trade-off**: Removing `pb-8 rounded-b-3xl` guard is a visual correctness fix — any current usage without a card was silently broken (extra space). This is a fix, not a breaking change, but any screenshot tests would need updating.
