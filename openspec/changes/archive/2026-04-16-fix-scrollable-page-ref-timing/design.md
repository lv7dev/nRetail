## Context

`ScrollablePage` exposes its internal scroll container to parent components via a `scrollContainerRef` prop. The assignment currently lives in a `useEffect`:

```js
useEffect(() => {
  if (scrollContainerRef) {
    scrollContainerRef.current = internalRef.current;
  }
}, [scrollContainerRef]);
```

`TabbedViewPanels` (a descendant of `ScrollablePage`) attaches a passive scroll listener in its own `useEffect`, reading `outerScrollRef.current` (the same ref object) to get the scroll container element.

React effect execution order within a single commit is **bottom-up** (children before parents). Both effects are `useEffect`, so:

```
1. TabbedViewPanels.useEffect  → outerScrollRef.current is null  → listener not attached ✗
2. ScrollablePage.useEffect    → scrollContainerRef.current = internalRef.current
```

The listener is silently skipped. `lastKnownScrollTopRef` stays `0` indefinitely. Every tab-switch save writes `0`, and restoring always scrolls to the top.

Note: `internalRef.current` (the DOM element) is already set by React during the commit phase — before any effect runs. The `useEffect` wrapper adds no value for the assignment itself; it was never needed for correctness and only creates the ordering hazard.

## Goals / Non-Goals

**Goals:**
- Ensure `scrollContainerRef.current` is set before any descendant `useEffect` can read it
- No observable behaviour change for existing consumers

**Non-Goals:**
- Changing any other aspect of `ScrollablePage`
- Fixing the `TabbedViewPanels` listener logic (covered in `fix-tabbed-view-scroll-save`)
- Addressing any other timing issues in the app

## Decisions

### 1. Move assignment to `useLayoutEffect`

React guarantees: **all `useLayoutEffect`s complete before any `useEffect` fires** in a given commit. Moving the one assignment to `useLayoutEffect` fixes the ordering for any current or future descendant that reads the ref in a `useEffect`:

```
1. TabbedViewPanels.useLayoutEffect  (tab switch logic — unchanged)
2. ScrollablePage.useLayoutEffect    → scrollContainerRef.current = internalRef.current  ✓
   [Paint]
3. TabbedViewPanels.useEffect        → outerScrollRef.current IS set → listener attaches ✓
4. ScrollablePage.useEffect          (remaining passive effects)
```

**Alternative considered:** Remove the effect entirely and assign the ref directly during render (since `internalRef.current` is set at commit time). Rejected — reading/writing DOM refs outside effects is a React anti-pattern and breaks Strict Mode double-invoke semantics.

**Alternative considered:** Keep `useEffect` but add a longer-lived re-run mechanism (e.g. observe `outerScrollRef.current` becoming non-null). Rejected — complex, fragile, and solves the symptom not the cause.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `useLayoutEffect` runs synchronously before paint — any exception here blocks the frame | The assignment is a single property write; cannot throw |
| SSR environments warn on `useLayoutEffect` | This project is a Zalo Mini App (client-only) — no SSR concern; same situation as `TabbedViewPanels` |
