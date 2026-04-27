## ADDED Requirements

### Requirement: Both outlet tabs support pull-to-refresh
`OutletListPage` SHALL pass `onRefresh` and `isRefreshing` to both `TabbedView.Panel` components. `onRefresh` SHALL call the panel's corresponding TanStack Query `refetch` (`connectedQuery.refetch()` for the connected panel, `notConnectedQuery.refetch()` for the not-connected panel). `isRefreshing` SHALL be `true` when the query is fetching AND not fetching the next page (`isFetching && !isFetchingNextPage`), so the spinner appears during a full refresh but not during incremental load-more.

Since inactive panels are hidden via `display: none`, only the active tab's panel can receive touch or wheel events — "refresh active tab only" is enforced by layout without conditional prop logic.

#### Scenario: Pull-to-refresh triggers connected query refetch
- **WHEN** the Connected tab is active and the user completes a pull-to-refresh gesture
- **THEN** `connectedQuery.refetch()` is called and the connected outlet list refreshes from page 1

#### Scenario: Pull-to-refresh triggers not-connected query refetch
- **WHEN** the Not Connected tab is active and the user completes a pull-to-refresh gesture
- **THEN** `notConnectedQuery.refetch()` is called and the not-connected outlet list refreshes from page 1

#### Scenario: Refresh spinner shows during a full refresh
- **WHEN** a pull-to-refresh gesture has been triggered and the query is refetching
- **THEN** `isRefreshing` is `true` and the pull indicator shows a spinner

#### Scenario: Refresh spinner does not show during load-more
- **WHEN** the user scrolls to the bottom and a next-page fetch is in progress
- **THEN** `isRefreshing` is `false` (the refresh spinner is not visible; only the load-more spinner at the bottom is shown)

#### Scenario: Pull-to-refresh works when content is shorter than the viewport
- **WHEN** a tab has fewer outlets than the visible screen height
- **THEN** the user can still complete a pull-to-refresh gesture anywhere in the panel area and `onRefresh` is called
