## MODIFIED Requirements

### Requirement: Outer mode saves per-tab scrollTop on tab switch
In outer mode, `TabbedView.Panels` SHALL record the user's last scroll position for the outgoing tab whenever the active tab changes. The saved value SHALL be the `scrollTop` from the most recent `scroll` event on the outer container — not `outerScrollRef.current.scrollTop` read at layout time, which may be clamped by the browser after `display: none` reduces scroll height.

Implementation: `TabbedViewPanels` SHALL maintain a `lastKnownScrollTopRef` updated by a passive `scroll` event listener on `outerScrollRef.current` (attached in outer mode only). The save step in `useLayoutEffect` SHALL use `lastKnownScrollTopRef.current` as the value to store.

#### Scenario: ScrollTop is saved when switching away from a tab
- **WHEN** the outer scroll is at `800px` and the user switches from Tab A to Tab B
- **THEN** the saved position for Tab A is `800`

#### Scenario: Correct position saved after load-more grows the tab content
- **WHEN** Tab A starts with 8 items, load-more adds 4 more items (total 12), the user scrolls to the bottom (scrollTop = X, showing item 12), and then switches to Tab B (which has 8 items, max scrollTop = Y where Y < X)
- **THEN** the saved position for Tab A is X (the pre-switch user position), not Y (the browser-clamped value)

#### Scenario: Returning to a tab restores the correct position after load-more
- **WHEN** the scenario above has occurred and the user switches back to Tab A
- **THEN** `outerScrollRef.current.scrollTop` is set to X, showing item 12 (not item 8)

#### Scenario: Scroll listener is only attached in outer mode
- **WHEN** `TabbedView.Panels` is in `mode="self"`
- **THEN** no scroll listener is attached to any outer container
