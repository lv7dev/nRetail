## Why

On iOS, a strong upward fling to scroll back to the top triggers the platform's rubber-band elastic scroll. During the bounce, `scrollTop` oscillates between `0` and ~4px repeatedly. `handleScroll` fires on every oscillation tick, emitting rapid-fire `onCollapsedChange` flips that fight the `OutletContextCard`'s 200ms CSS animation — the card visibly collapses and expands several times before settling. The current knife-edge threshold (`scrollTop > 0`) has no tolerance for this platform-native behaviour.

## What Changes

- **Part A — CSS:** Add `overscroll-behavior-y: contain` to the `ScrollablePage` scroll container. This instructs iOS to contain elastic bounce within the element and not propagate it to parent scrollers, reducing the visible bounce amplitude.
- **Part B — Logic:** Replace the `scrollTop > 0` knife-edge in `handleScroll` with a hysteresis band:
  - Emit `onCollapsedChange(true)` only when `scrollTop >= 20`
  - Emit `onCollapsedChange(false)` only when `scrollTop === 0`
  - Emit nothing for `scrollTop` in the range `1–19` (dead zone)
- Define the threshold as a named constant `COLLAPSE_THRESHOLD_PX = 20`.
- No changes to `ScrollablePageProps`.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `scrollable-page`: The collapse/expand trigger requirement changes from a knife-edge `scrollTop > 0` to a hysteresis band with a 20px collapse threshold and 0px expand threshold.

## Impact

- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — `overscroll-behavior-y: contain` on the container div; `handleScroll` hysteresis logic; `COLLAPSE_THRESHOLD_PX` constant
- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.test.tsx` — existing collapse tests update to use the new thresholds; new dead-zone tests added
- No other files affected.
