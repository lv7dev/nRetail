## Why

In `TabbedView` outer-scroll mode, when the user switches away from a tab whose content grew via load-more, the restored scroll position is wrong — the user lands at an earlier position (e.g. product 15) instead of where they actually were (e.g. product 23). The root cause is that `display: none` on the outgoing panel reduces the scroll container's `scrollHeight`, and the browser clamps `scrollTop` before `useLayoutEffect` reads it to save.

## What Changes

- Add a passive `scroll` event listener on the outer scroll container (outer mode only) that continuously writes `element.scrollTop` into a `lastKnownScrollTopRef`
- In `useLayoutEffect`, replace the `outerScrollElement.scrollTop` read used for saving with `lastKnownScrollTopRef.current` — a value set by user-driven scroll events, immune to layout-time clamping
- Update the `tabbed-view` spec requirement to clarify that the saved value must reflect the user's actual scroll position, not the post-layout clamped value

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `tabbed-view`: The save-on-switch requirement must clarify that the recorded `scrollTop` is the user's last scroll position, not `outerScrollRef.current.scrollTop` at layout time (which may be clamped when `display:none` reduces scroll height)

## Impact

- **Modified**: `miniapp/src/components/shared/TabbedView/TabbedViewPanels.tsx` — one new `useEffect` for the scroll listener, one line change in `useLayoutEffect`
- **Modified**: `miniapp/src/components/shared/TabbedView/TabbedView.test.tsx` — tests covering the save path need to simulate the scroll listener populating the ref
- **Modified**: `openspec/changes/reusable-tabbed-view/specs/tabbed-view/spec.md` — amend the save requirement with a clarifying note
- No public API or prop changes; no new dependencies
