## ADDED Requirements

### Requirement: scrollContainerRef is assigned before passive effects run
When `scrollContainerRef` is provided, `ScrollablePage` SHALL assign `scrollContainerRef.current = internalScrollContainer` in a `useLayoutEffect`, not a `useEffect`. This guarantees the ref is populated before any descendant component's `useEffect` reads it, regardless of component tree depth.

#### Scenario: Descendant useEffect finds the ref set on first mount
- **WHEN** a descendant component reads `outerScrollRef.current` in its `useEffect` on the initial render
- **THEN** `outerScrollRef.current` is the `ScrollablePage` scroll container element, not `null`

#### Scenario: scrollContainerRef is assigned before paint
- **WHEN** `ScrollablePage` mounts with a `scrollContainerRef` prop
- **THEN** `scrollContainerRef.current` is set during the layout phase, before the browser paints
