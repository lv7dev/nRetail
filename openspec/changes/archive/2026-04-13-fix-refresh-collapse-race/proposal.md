## Why

`ScrollablePage` has two independent race conditions where pull-to-refresh and card collapse/expand fire simultaneously, producing jarring UI: the card animates while a refresh spinner appears, or the collapse triggers mid-pull when the user intended to refresh. Both stem from timing gaps in the touch and wheel event handling paths.

## What Changes

- **Bug 1 (touch):** Attach an imperative `touchmove` listener with `{ passive: false }` to the scroll container. Call `preventDefault()` whenever `pullingRef.current` is true, physically preventing the browser from scrolling the container during an active pull gesture. The existing React `onTouchMove` synthetic handler is kept for gesture tracking; the imperative listener handles only the scroll suppression.
- **Bug 2 (wheel):** Add an `arrivedAtTopRef` timestamp ref that records when `scrollTop` first transitions to `0` in `handleScroll`. Gate `handleWheel` to early-return if fewer than 400 ms have elapsed since that timestamp, preventing accidental refresh fires on the first upward wheel tick after scrolling back to the top.
- No changes to `ScrollablePageProps` — zero API surface impact.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `scrollable-page`: Pull-to-refresh requirement gains two new correctness constraints — simultaneous collapse and refresh is prevented, and wheel refresh requires a settle period after arriving at the top.

## Impact

- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — imperative listener in a new `useEffect`, `arrivedAtTopRef` tracking in `handleScroll` and `handleWheel`
- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.test.tsx` — new test cases for both guards
- No other files affected.
