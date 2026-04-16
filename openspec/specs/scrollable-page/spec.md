## Requirements

### Requirement: ScrollablePage is a full-height scroll container
`ScrollablePage` SHALL render as a `flex: 1`, `overflow-y: auto` container that fills the remaining vertical space in its parent. All page content is rendered as children inside it.

#### Scenario: Content taller than viewport scrolls
- **WHEN** the children content exceeds the available height
- **THEN** the user can scroll the content within `ScrollablePage` without the parent layout shifting

---

### Requirement: ScrollablePage reports scroll-driven collapse state via onCollapsedChange
`ScrollablePage` SHALL emit `onCollapsedChange` with a hysteresis band to prevent spurious flips caused by iOS elastic scroll bounce. The rules are:

- Emit `onCollapsedChange(false)` when `scrollTop` reaches exactly `0`
- Emit `onCollapsedChange(true)` when `scrollTop` reaches `COLLAPSE_THRESHOLD_PX` (20) or above
- Emit nothing when `scrollTop` is between `1` and `COLLAPSE_THRESHOLD_PX - 1` (dead zone)
- Never emit the same value consecutively — deduplicate adjacent identical emissions

The scroll container SHALL have `overscroll-behavior-y: contain` applied to reduce iOS elastic bounce propagation.

#### Scenario: Collapsed emitted when scrolled past threshold
- **WHEN** the user scrolls down and `scrollTop` reaches `20px` or beyond
- **THEN** `onCollapsedChange(true)` is emitted once

#### Scenario: Expanded emitted when back at top
- **WHEN** the user scrolls up and `scrollTop` reaches exactly `0`
- **THEN** `onCollapsedChange(false)` is emitted once

#### Scenario: Dead zone emits nothing
- **WHEN** `scrollTop` is between `1` and `19px` (inclusive)
- **THEN** `onCollapsedChange` is NOT called

#### Scenario: iOS bounce oscillation absorbed by dead zone
- **WHEN** `scrollTop` oscillates between `0` and values below `20px` (iOS elastic bounce)
- **THEN** `onCollapsedChange` is called at most once with `false` when `scrollTop` hits `0` — no interleaved `true` emissions

#### Scenario: Consecutive same-value emissions deduplicated
- **WHEN** `scrollTop` moves between two values both above the collapse threshold (e.g. 30px → 50px → 80px)
- **THEN** `onCollapsedChange(true)` is emitted only once, not on every scroll tick

#### Scenario: No emission when onCollapsedChange not provided
- **WHEN** the `onCollapsedChange` prop is not provided
- **THEN** no error is thrown and scroll behaviour is unaffected

---

### Requirement: ScrollablePage triggers onRefresh when the user pulls down at the top
When the user drags downward from the top of the scroll container (scrollTop === 0) by more than 60px and then releases, `ScrollablePage` SHALL call `onRefresh`. During the gesture, a pull indicator is shown: below 60px it shows "Pull down to refresh"; at or above 60px it shows "Release to refresh". The indicator is replaced by a spinner while `isRefreshing` is `true`. If `onRefresh` is not provided, pull-to-refresh is disabled.

#### Scenario: Pull-to-refresh triggers callback on release
- **WHEN** `onRefresh` is provided and the user pulls down ≥ 60px then releases
- **THEN** `onRefresh` is called once

#### Scenario: Pull indicator shows below threshold
- **WHEN** the user is pulling down and `pullDistance` is between `1` and `59px`
- **THEN** a "Pull down to refresh" label with a downward chevron is visible; `onRefresh` is NOT called

#### Scenario: Pull indicator changes at threshold
- **WHEN** the user pulls down to `60px` or beyond
- **THEN** the chevron flips upward and the label changes to "Release to refresh"

#### Scenario: Release below threshold cancels gesture
- **WHEN** the user releases before reaching `60px`
- **THEN** `onRefresh` is NOT called and the indicator disappears

#### Scenario: Indicator disappears after refresh completes
- **WHEN** `onRefresh` has been called and `isRefreshing` transitions to `false`
- **THEN** the pull-to-refresh indicator is no longer visible

#### Scenario: No pull gesture when not at top
- **WHEN** the scroll position is not at the top (scrollTop > 0)
- **THEN** the pull-to-refresh gesture is not activated regardless of drag direction

#### Scenario: Pull-to-refresh disabled when onRefresh not provided
- **WHEN** `onRefresh` prop is not provided
- **THEN** no pull gesture indicator appears and no callback is triggered

---

### Requirement: Pull gesture prevents container scroll for its duration
While a pull-to-refresh gesture is active (finger has moved downward past the direction threshold from `scrollTop === 0`), `ScrollablePage` SHALL prevent the scroll container from scrolling. This ensures `onCollapsedChange` is not fired during an active pull gesture, eliminating the simultaneous refresh + collapse condition.

#### Scenario: Container does not scroll while pulling
- **WHEN** the user begins a downward pull gesture at `scrollTop === 0` and the direction threshold is met
- **THEN** the scroll container's `scrollTop` remains `0` for the duration of the gesture

#### Scenario: Collapse does not fire during an active pull gesture
- **WHEN** a pull gesture is active and `pullDistance > 0`
- **THEN** `onCollapsedChange` is NOT called

#### Scenario: Normal scroll resumes after pull gesture ends
- **WHEN** the pull gesture ends (finger lifts) without triggering refresh
- **THEN** the scroll container resumes normal scroll behaviour on the next touch sequence

---

### Requirement: Wheel refresh requires a settle period after arriving at the top
After `scrollTop` transitions to `0`, `ScrollablePage` SHALL suppress wheel-triggered refresh for 400 ms. This prevents an accidental refresh fire on the first upward wheel tick after scrolling back to the top, which would collide with the card expand animation.

#### Scenario: Wheel refresh blocked immediately after scroll-to-top
- **WHEN** the user wheels upward and `scrollTop` just reached `0`
- **THEN** `onRefresh` is NOT called if fewer than 400 ms have elapsed since `scrollTop` first became `0`

#### Scenario: Wheel refresh allowed after settle period
- **WHEN** the user wheels upward at `scrollTop === 0` and at least 400 ms have elapsed since arriving at the top
- **THEN** `onRefresh` is called normally

#### Scenario: Wheel refresh allowed when page opens at top
- **WHEN** the page mounts with `scrollTop === 0` and the user wheels upward without having scrolled at all
- **THEN** `onRefresh` is called normally (no prior scroll-to-top event, no settle period applies)

---

### Requirement: ScrollablePage triggers onLoadMore when the user reaches the bottom
`ScrollablePage` SHALL use an IntersectionObserver on a sentinel element at the end of its children. When the sentinel enters the viewport AND `hasMore` is `true` AND `isLoadingMore` is `false`, it SHALL call `onLoadMore` once. If `onLoadMore` is not provided, the sentinel is not rendered.

#### Scenario: Load-more triggers at bottom
- **WHEN** `onLoadMore` and `hasMore={true}` are provided and the user scrolls to reveal the bottom sentinel
- **THEN** `onLoadMore` is called once

#### Scenario: Load-more not triggered when hasMore is false
- **WHEN** the bottom sentinel is visible but `hasMore={false}`
- **THEN** `onLoadMore` is NOT called

#### Scenario: Load-more not triggered while already loading
- **WHEN** the bottom sentinel is visible, `hasMore={true}`, but `isLoadingMore={true}`
- **THEN** `onLoadMore` is NOT called again

#### Scenario: Loading indicator shown while loading more
- **WHEN** `isLoadingMore={true}`
- **THEN** a loading spinner is visible at the bottom of the content

#### Scenario: Load-more disabled when onLoadMore not provided
- **WHEN** `onLoadMore` prop is not provided
- **THEN** no sentinel is rendered and no load-more behavior occurs

---

### Requirement: scrollContainerRef is assigned before passive effects run
When `scrollContainerRef` is provided, `ScrollablePage` SHALL assign `scrollContainerRef.current = internalScrollContainer` in a `useLayoutEffect`, not a `useEffect`. This guarantees the ref is populated before any descendant component's `useEffect` reads it, regardless of component tree depth.

#### Scenario: Descendant useEffect finds the ref set on first mount
- **WHEN** a descendant component reads `outerScrollRef.current` in its `useEffect` on the initial render
- **THEN** `outerScrollRef.current` is the `ScrollablePage` scroll container element, not `null`

#### Scenario: scrollContainerRef is assigned before paint
- **WHEN** `ScrollablePage` mounts with a `scrollContainerRef` prop
- **THEN** `scrollContainerRef.current` is set during the layout phase, before the browser paints
