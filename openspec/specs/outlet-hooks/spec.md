### Requirement: useOutlets hook encapsulates all TanStack Query logic for the outlets domain
`useOutlets({ activeTab, searchTerm })` SHALL be the single place where `useInfiniteQuery` and `useMutation` calls for outlets are made. Pages and components SHALL NOT call `outletService` directly. The hook SHALL return:
- `connectedQuery` — the full `UseInfiniteQueryResult` for connected outlets
- `notConnectedQuery` — the full `UseInfiniteQueryResult` for not-connected outlets
- `connectedOutlets: Outlet[]` — flattened list from `connectedQuery.data?.pages`
- `notConnectedOutlets: Outlet[]` — flattened list from `notConnectedQuery.data?.pages`
- `hasSearch: boolean` — true when `searchTerm.length > 0`
- `handleMembershipAction(outletId: string, action: UpdateMembershipAction): void`

#### Scenario: Connected query is enabled only on the connected tab
- **WHEN** `activeTab` is `'connected'`
- **THEN** `connectedQuery` fetches and `notConnectedQuery` remains idle

#### Scenario: Not-connected query is enabled only on the not-connected tab
- **WHEN** `activeTab` is `'not-connected'`
- **THEN** `notConnectedQuery` fetches and `connectedQuery` remains idle

#### Scenario: Search term flows into both query keys
- **WHEN** `searchTerm` changes
- **THEN** both query keys include the new `q` value, resetting pagination for the active tab

#### Scenario: Hook returns flattened outlet arrays
- **WHEN** the active query has loaded multiple pages
- **THEN** `connectedOutlets` (or `notConnectedOutlets`) is a flat `Outlet[]` combining all pages

---

### Requirement: Query key convention for outlets
The query key SHALL follow `['outlets', { connected: boolean, q: string }]`. The `q` field SHALL use `debouncedSearchTerm || undefined` (falsy search strings become `undefined` to avoid cache fragmentation on empty strings).

#### Scenario: Empty search does not fragment the query cache
- **WHEN** `searchTerm` is an empty string
- **THEN** the query key uses `q: undefined`, matching the no-search cache entry

#### Scenario: Non-empty search gets its own cache entry
- **WHEN** `searchTerm` is `'abc'`
- **THEN** the query key uses `q: 'abc'`, resulting in a separate cache entry from the no-search query

---

### Requirement: handleMembershipAction dispatches confirm or reject mutations
`handleMembershipAction(outletId, 'confirm')` SHALL call `outletService.updateMembership(outletId, 'confirm')`. On success it SHALL invalidate both the connected and not-connected outlet queries (an outlet moves from not-connected to connected). `handleMembershipAction(outletId, 'reject')` SHALL call `outletService.updateMembership(outletId, 'reject')`. On success it SHALL invalidate only the not-connected query (a rejected outlet disappears from not-connected).

#### Scenario: Confirming membership invalidates both query groups
- **WHEN** `handleMembershipAction(outletId, 'confirm')` succeeds
- **THEN** both `['outlets', { connected: true, ... }]` and `['outlets', { connected: false, ... }]` query groups are invalidated and refetched

#### Scenario: Rejecting membership invalidates only not-connected queries
- **WHEN** `handleMembershipAction(outletId, 'reject')` succeeds
- **THEN** only `['outlets', { connected: false, ... }]` query group is invalidated

---

### Requirement: useDebounce generic hook
`useDebounce<T>(value: T, delay: number): T` SHALL return the debounced value, updating only after `delay` milliseconds have elapsed since the last change to `value`. The raw state is owned by the caller.

#### Scenario: Value is not updated immediately on change
- **WHEN** `value` changes
- **THEN** the returned debounced value does not change until `delay` ms have passed without further changes

#### Scenario: Rapid changes only trigger one update
- **WHEN** `value` changes multiple times within `delay` ms
- **THEN** the debounced value updates exactly once, to the final value, after `delay` ms of inactivity

#### Scenario: Timeout is cleared on unmount
- **WHEN** the consuming component unmounts before `delay` ms elapse
- **THEN** no state update is scheduled after unmount (cleanup function cancels the timeout)
