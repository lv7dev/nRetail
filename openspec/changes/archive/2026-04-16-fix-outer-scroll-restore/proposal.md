## Why

`TabbedViewPanels` in outer-scroll mode has two bugs that cause the wrong scroll position to be shown when switching to a first-visit tab: a timing bug where `useEffect` fires after the browser paints (causing a visible flash to the bottom of the incoming tab's content), and a coordinate system bug where `panelsRef.current.offsetTop` is relative to the element's `offsetParent` rather than the scroll container — producing an incorrect fallback position. There is also a leftover debug `console.log` that was not removed before shipping.

## What Changes

- Replace `useEffect` with `useLayoutEffect` in `TabbedViewPanels` so scroll position is corrected before the browser paints
- Replace `panelsRef.current.offsetTop` fallback with a `getBoundingClientRect()`-based calculation that correctly maps to the scroll container's coordinate system
- Remove leftover `console.log` debug statement

## Capabilities

### New Capabilities

<!-- None — this is a bug fix with no new capabilities -->

### Modified Capabilities

- `tabbed-view`: The requirement for first-visit scroll behaviour in outer mode needs a corrected WHEN/THEN to specify synchronous correction (before paint) and coordinate-system-safe positioning

## Impact

- **Modified file**: `components/shared/TabbedView/TabbedViewPanels.tsx` only
- **No API changes**, no prop changes, no new dependencies
- Existing tests for scroll save/restore remain valid; the test that asserts `offsetTop`-based fallback needs to be updated to match the corrected calculation
