## MODIFIED Requirements

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
