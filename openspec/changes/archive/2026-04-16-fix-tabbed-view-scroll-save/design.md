## Context

`TabbedViewPanels` manages scroll position save/restore in outer-scroll mode. On tab switch, `useLayoutEffect` fires after React commits the DOM mutations (applying `display: none` to the outgoing panel). At that point, the browser has already executed a layout pass that clamps `scrollTop` to the new maximum — which is lower than the user's actual position when the outgoing panel had more content (e.g., after load-more).

The existing `fix-outer-scroll-restore` change already addressed two prior bugs:
1. Replaced `useEffect` with `useLayoutEffect` to prevent a visible flash on first-visit scrolls
2. Replaced `offsetTop` with `getBoundingClientRect()` for correct coordinate math

This change addresses a third bug: the **save** path in `useLayoutEffect` reads `outerScrollElement.scrollTop` after the layout pass has already clamped it.

```
User at scrollTop = X (e.g. product 23, bottom of loaded list)
  → tab switch → React commits: bought → display:none, viewed → visible
  → layout pass: scrollHeight shrinks → browser clamps scrollTop to Y (e.g. product 15 position)
  → useLayoutEffect fires → reads Y (clamped!) → saves Y for 'bought'
  → switch back to 'bought' → restores Y → user sees product 15, not 23
```

## Goals / Non-Goals

**Goals:**
- Save the user's actual scroll position (pre-clamp) when switching away from a tab
- Keep the existing first-visit scroll logic and incoming tab restore path unchanged
- Zero public API or prop changes

**Non-Goals:**
- Changing any other aspect of `TabbedViewPanels` behaviour
- Optimising scroll performance beyond what `{ passive: true }` already provides
- Fixing self-scroll mode (unaffected — each panel owns its own scroll container)

## Decisions

### 1. Passive scroll listener to track last user-driven scrollTop

Attach a `scroll` event listener on `outerScrollRef.current` that writes `element.scrollTop` into a `lastKnownScrollTopRef`. In `useLayoutEffect`, replace the `outerScrollElement.scrollTop` read (for the save step) with `lastKnownScrollTopRef.current`.

```
scroll event (user-driven or programmatic set):
  → lastKnownScrollTopRef.current = element.scrollTop   ← fires BEFORE any tab change

display:none layout clamp (browser, no scroll event):
  → scrollTop changes internally but NO scroll event fires
  → lastKnownScrollTopRef.current stays at user's actual position ✓

useLayoutEffect (tab switch save step):
  → scrollPositionsRef.current.set(previousTab, lastKnownScrollTopRef.current)  ← correct ✓
```

**Why the listener is correct:** `display: none` on a child element does not fire a `scroll` event on the parent — the browser adjusts `scrollTop` silently during layout. User scrolling and programmatic `element.scrollTop = value` assignments both fire `scroll`. Therefore `lastKnownScrollTopRef` always holds the last intentional position.

**Alternative considered:** Read `scrollTop` during the React render phase (before commit). Rejected — reading DOM state during render is a side-effect in a function that may be called multiple times (Strict Mode, concurrent rendering). Unreliable.

**Alternative considered:** Save in `onTabChange` before `setState`. Would require passing a pre-change callback from `TabbedView` into `TabbedViewPanels`, adding coupling between the two components. The passive listener approach is fully self-contained within `TabbedViewPanels`.

### 2. Listener scoped to outer mode only

The listener is attached only when `mode === 'outer'`. In self mode, each panel owns its own `ScrollablePage` and scroll position is preserved natively by `display: none` (no save/restore needed). Attaching the listener in self mode would be dead code.

### 3. Restore path and first-visit path are unchanged

`lastKnownScrollTopRef` is only used for **saving** the outgoing tab's position. The restore step (`outerScrollElement.scrollTop = savedScrollTop`) and the first-visit scroll calculation remain exactly as they are. No behaviour changes for the incoming tab.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Listener fires on every scroll frame at 60fps | Handler is `ref.current = el.scrollTop` — one read, one write. Negligible. `{ passive: true }` ensures no impact on scroll thread. |
| `outerScrollRef.current` may be null when the effect runs | Guard: `if (!outerScrollElement) return` — same null-check pattern already used in `useLayoutEffect` |
| Test setup doesn't simulate the scroll listener | Tests need to manually set `lastKnownScrollTopRef.current` OR trigger a `scroll` event on the container to simulate user scrolling before the tab switch |
