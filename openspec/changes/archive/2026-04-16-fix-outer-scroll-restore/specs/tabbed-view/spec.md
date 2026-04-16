## MODIFIED Requirements

### Requirement: Outer mode scrolls to component top on first tab visit, accounting for sticky siblings
In outer mode, when switching to a tab that has no saved position (first visit), `TabbedView.Panels` SHALL compute the target scroll position using `getBoundingClientRect()` on both the panels root element and the outer scroll container, subtract the height of any directly preceding sibling that has `position: sticky` (e.g. a sticky `TabbedView.TabBar`), and set `outerScrollRef.current.scrollTop` to this value synchronously before the browser paints (via `useLayoutEffect`).

The calculation SHALL be:
```
stickyOffset = (prevSibling && getComputedStyle(prevSibling).position === 'sticky')
               ? prevSibling.getBoundingClientRect().height
               : 0

targetScrollTop = outerScrollElement.scrollTop
                  + panelsRef.current.getBoundingClientRect().top
                  - outerScrollElement.getBoundingClientRect().top
                  - stickyOffset
```

#### Scenario: First visit scrolls to component top without flash
- **WHEN** the user switches to a tab for the first time (no saved scroll position)
- **THEN** the outer scroll container's `scrollTop` is updated before the browser paints, with no visible flash

#### Scenario: First visit accounts for sticky TabBar sibling
- **WHEN** `TabbedView.TabBar` is a direct preceding sibling of `TabbedView.Panels` with `position: sticky`
- **THEN** the target `scrollTop` is reduced by the TabBar's rendered height so the first panel item appears below the TabBar, not behind it

#### Scenario: Sticky offset is zero when TabBar is not a sibling
- **WHEN** `TabbedView.TabBar` is placed in a header (Mode 3) and is not a DOM sibling of `TabbedView.Panels`
- **THEN** `stickyOffset` is `0` and the calculation is unaffected

#### Scenario: Subsequent visits restore saved position
- **WHEN** the user has previously scrolled a tab and returns to it
- **THEN** the outer scroll restores the saved `scrollTop` value directly, without any sticky offset adjustment
