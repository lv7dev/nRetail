## Context

`ScrollablePage` handles pull-to-refresh via React synthetic touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) and wheel-overscroll via `onWheel`. The collapse signal is emitted via `onCollapsedChange` inside `handleScroll`.

**Bug 1 — touch/collapse race:**
React 17+ registers `onTouchMove` as a passive listener. Passive listeners cannot call `event.preventDefault()`, so the browser scrolls the container in parallel with our pull-gesture tracking. On the first `touchMove` tick where `scrollTop === 0 && deltaY > 0`, `pullingRef` is set to `true`. On the very next tick the browser may have scrolled the container; `onScroll` fires, `onCollapsedChange(true)` fires, and the card starts collapsing — while the pull gesture is still active and will trigger `onRefresh()` on release.

**Bug 2 — wheel arrival race:**
`handleWheel` guards against `scrollTop !== 0`, so it only fires at the top. But the transition from scrolled → `scrollTop=0` is driven by the same wheel event stream. The tick that lands at `scrollTop=0` fires `handleScroll` (expand card) and the very next upward tick fires `handleWheel` (trigger refresh) — the card expand animation (200 ms) overlaps the refresh.

## Goals / Non-Goals

**Goals:**
- Prevent the browser from scrolling the container while a pull gesture is active (fix Bug 1)
- Prevent wheel refresh from firing for 400 ms after `scrollTop` first returns to `0` (fix Bug 2)
- All existing pull-to-refresh and scroll behaviour remains unchanged outside these two guards

**Non-Goals:**
- Changing the 60 px pull threshold
- Changing the card animation duration
- Fixing any visual jank that is not caused by these two specific races
- Supporting `passive: false` on browsers that don't allow it (degrade gracefully)

## Decisions

### Decision: Imperative `useEffect` listener for `{ passive: false }` touchmove

React synthetic `onTouchMove` cannot call `preventDefault()`. The only way to suppress the browser scroll during a pull gesture is to add an imperative listener with `{ passive: false }` to the DOM node directly.

```ts
useEffect(() => {
  const el = internalRef.current;
  if (!el || !onRefresh) return;

  const prevent = (e: TouchEvent) => {
    if (pullingRef.current) e.preventDefault();
  };

  el.addEventListener('touchmove', prevent, { passive: false });
  return () => el.removeEventListener('touchmove', prevent);
}, [onRefresh]);
```

The handler reads `pullingRef.current` (a ref, not state) so it never needs to be re-registered when pull state changes — the closure captures the ref object, not its value.

**Alternative considered:** Gate `onCollapsedChange` inside `handleScroll` when `pullingRef` is true. Rejected — it fixes the symptom (collapse fires) but not the cause (browser scroll during pull). The container's `scrollTop` would still change, leaving state and DOM out of sync until the next scroll event.

**Alternative considered:** Move pull gesture detection to `touchStart` and call `preventDefault()` there. Rejected — `touchStart` fires before direction is known; pre-emptively blocking all downward touches at the top would prevent intentional downward scrolling if content is added above the scroll position.

### Decision: `arrivedAtTopRef` timestamp + 400 ms wheel settle guard

Record `performance.now()` (monotonic, no clock-skew) in `handleScroll` whenever `scrollTop` transitions to `0`. Gate `handleWheel` to skip if fewer than 400 ms have passed.

```ts
// In handleScroll:
if (event.currentTarget.scrollTop === 0) {
  arrivedAtTopRef.current = performance.now();
}

// In handleWheel:
const elapsed = performance.now() - (arrivedAtTopRef.current ?? -Infinity);
if (elapsed < 400) return;
```

400 ms is chosen to cover the card expand animation (200 ms) plus a comfortable margin for the momentum scroll to settle, without being long enough to feel sluggish for intentional wheel refresh.

**Alternative considered:** Block wheel refresh while `collapsed === true` (i.e. require the card to be fully expanded). Rejected — `ScrollablePage` does not own `collapsed` state; it is held in `HomePage`. Threading that state back into `ScrollablePage` would couple an infrastructure component to page-level state.

**Alternative considered:** Debounce `arrivedAtTopRef` reset on each scroll tick. Rejected — `performance.now()` timestamp is simpler, avoids timer cleanup, and the math is trivially correct.

### Decision: `arrivedAtTopRef` initialises to `null`, guard treats `null` as "never arrived" (safe to refresh)

If the user opens the page already at the top and immediately uses the wheel, `arrivedAtTopRef` is `null`. The guard uses `arrivedAtTopRef.current ?? -Infinity`, so `elapsed` is `+Infinity`, which is ≥ 400 — wheel refresh is allowed. This is correct: there is no recent scroll-to-top, so no race condition exists.

## Risks / Trade-offs

- **[Risk]** `{ passive: false }` on a scroll container can affect browser scroll performance hints. Mitigation: the listener only calls `preventDefault()` when `pullingRef.current` is true (i.e. an active pull gesture is detected). Under normal scrolling, `preventDefault()` is never called and the browser optimisation is not affected.
- **[Risk]** 400 ms settle guard may frustrate a user who intentionally scrolls to the top and immediately wants to wheel-refresh. Mitigation: 400 ms is shorter than typical bounce/momentum settle time; intentional wheel-refresh users will naturally pause before refreshing. If UX testing shows friction, the value can be tuned as a named constant.
- **[Trade-off]** Two separate mechanisms (imperative listener + timestamp ref) for two different failure modes. Each is the minimal correct fix for its specific root cause; a single unified mechanism would obscure the distinct nature of the bugs.
