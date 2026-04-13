## Context

iOS Safari's rubber-band (elastic) scroll is a platform feature that cannot be disabled cleanly without breaking native scroll feel. When a user flings upward and the container reaches `scrollTop = 0`, iOS continues the animation visually past the top. During this overshoot-and-return phase, the browser fires `scroll` events with `scrollTop` values oscillating between `0` and approximately `2–8px` depending on fling velocity. Each event fires `handleScroll`, which currently emits `onCollapsedChange(scrollTop > 0)` on every tick — resulting in alternating `true/false` signals at ~16ms intervals for 300–600ms.

`CollapsibleHeader` applies `transition-all duration-200` to the card wrapper. Each state flip restarts the animation, causing the visible jitter.

## Goals / Non-Goals

**Goals:**
- Reduce the visible elastic bounce amplitude on the scroll container (CSS)
- Prevent `onCollapsedChange` from emitting during iOS bounce oscillation (logic)
- Keep the collapse/expand UX feel unchanged for normal scrolling

**Non-Goals:**
- Eliminating iOS elastic scroll entirely (would require `overscroll-behavior: none`, which removes the native feel)
- Changing the card animation duration
- Fixing any other platform's scroll behaviour

## Decisions

### Decision: `overscroll-behavior-y: contain` via Tailwind `overscroll-y-contain`

`overscroll-behavior-y: contain` tells the browser: confine the elastic scroll effect to this element; don't propagate momentum to any parent scroller. On iOS this reduces (but does not eliminate) visible bounce because the overshoot energy stays local. It is supported in iOS Safari 16+ and degrades gracefully (ignored) on older versions.

Tailwind ships `overscroll-y-contain` as a utility class — no custom CSS needed.

**Alternative considered:** `overscroll-behavior-y: none` — eliminates bounce entirely. Rejected: removes the native feel that iOS users expect; feels broken on the platform.

**Alternative considered:** `-webkit-overflow-scrolling: touch` — legacy property, deprecated, no longer affects modern iOS. Rejected: no effect.

### Decision: Hysteresis band with `COLLAPSE_THRESHOLD_PX = 20`

Replace `scrollTop > 0` with a two-threshold model:

```
scrollTop  0         1        19       20
           │◄── expand ──►│◄ dead zone ►│◄── collapse ──►
           │  (emit false) │ (emit nothing) │ (emit true)
```

The dead zone `1–19px` absorbs typical iOS bounce oscillation (measured 0–8px in practice). 20px is large enough to swallow any realistic bounce amplitude while being small enough that intentional scrolling triggers collapse promptly — the user cannot visually distinguish "collapsed at 1px" from "collapsed at 20px" scroll depth.

The expand threshold stays at `scrollTop === 0` (exact), not `< 20`, to avoid a scenario where the card expands prematurely when the user has scrolled down only a few pixels.

**Alternative considered:** Debounce `onCollapsedChange` by 50–100ms. Rejected: adds a perceptible delay between arriving at the top and the card expanding. 20px threshold has no delay — it fires the moment the real scroll position is stable.

**Alternative considered:** `scrollTop < 5` as the expand threshold (symmetric small band). Rejected: if the user scrolls down exactly 3px and stops, the card would expand even though they intended to scroll. `=== 0` is the correct semantic: "back at the very top."

### Decision: Named constant `COLLAPSE_THRESHOLD_PX = 20` at module level

Magic numbers in event handlers are hard to review and easy to break in future. A module-level constant makes the intent explicit and the value easy to tune if device testing reveals a better number.

### Decision: `[lastCollapsed, setLastCollapsed]` ref — no extra state

The hysteresis logic needs to know the previous `collapsed` state to implement the dead zone correctly (don't emit if the value wouldn't change). Use a `useRef` — not `useState` — to track the last emitted value so the comparison doesn't cause re-renders.

```ts
const lastCollapsedRef = useRef<boolean>(false);

// In handleScroll:
const scrollTop = event.currentTarget.scrollTop;
let next: boolean | null = null;
if (scrollTop === 0) next = false;
else if (scrollTop >= COLLAPSE_THRESHOLD_PX) next = true;
// else: dead zone — next stays null, nothing emitted

if (next !== null && next !== lastCollapsedRef.current) {
  lastCollapsedRef.current = next;
  onCollapsedChange?.(next);
}
```

This also naturally deduplicated consecutive same-value emissions (e.g. `true → true` during normal scrolling).

## Risks / Trade-offs

- **[Risk]** `overscroll-behavior-y: contain` is ignored on iOS < 16 (Safari 15.x). Mitigation: the hysteresis band is the primary fix and works on all iOS versions; `contain` is a progressive enhancement.
- **[Trade-off]** The 20px dead zone means the collapse does not trigger until the user has scrolled 20px. On a fast scroll this is imperceptible. On a very slow deliberate 1px-at-a-time scroll the card stays expanded until 20px — acceptable given the alternative is visible jitter.
- **[Risk]** Future devices with higher-amplitude bounce may exceed 20px, reintroducing flicker. Mitigation: `COLLAPSE_THRESHOLD_PX` is a named constant; if device testing reveals a higher threshold is needed it is a one-line change.
