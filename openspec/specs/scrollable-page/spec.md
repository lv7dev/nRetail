## ADDED Requirements

### Requirement: ScrollablePage is a full-height scroll container
`ScrollablePage` SHALL render as a `flex: 1`, `overflow-y: auto` container that fills the remaining vertical space in its parent. All page content is rendered as children inside it.

#### Scenario: Content taller than viewport scrolls
- **WHEN** the children content exceeds the available height
- **THEN** the user can scroll the content within `ScrollablePage` without the parent layout shifting

---

### Requirement: ScrollablePage triggers onRefresh when the user pulls down at the top
When the user drags downward from the top of the scroll container (scrollTop === 0) by more than 60px, `ScrollablePage` SHALL show a loading indicator and call `onRefresh`. The indicator disappears when `isRefreshing` returns to `false`. If `onRefresh` is not provided, pull-to-refresh is disabled.

#### Scenario: Pull-to-refresh triggers callback
- **WHEN** `onRefresh` is provided and the user pulls down ≥ 60px from the top of the scroll area
- **THEN** `onRefresh` is called once and a refresh indicator is shown

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
