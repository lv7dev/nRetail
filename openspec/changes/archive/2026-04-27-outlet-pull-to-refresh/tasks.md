## 1. TabbedViewPanel — accept className prop

- [x] 1.1 Write failing test in `TabbedViewPanel.test.tsx`: panel outer div applies a provided `className`
- [x] 1.2 Add `className?: string` to `TabbedViewPanelProps` and apply it to the outer div in `TabbedViewPanel`
- [x] 1.3 Verify `TabbedViewPanel` tests pass

## 2. TabbedViewPanels — flex chain for mode="self"

- [x] 2.1 Write failing tests in `TabbedViewPanels.test.tsx`:
  - wrapper div has `flex flex-col flex-1 min-h-0` when `mode="self"`
  - wrapper div has no extra classes when `mode="outer"`
  - each panel div receives `className="flex flex-col flex-1 min-h-0"` when `mode="self"`
- [x] 2.2 Add `className={mode === 'self' ? 'flex flex-col flex-1 min-h-0' : undefined}` to the `panelsRef` wrapper div in `TabbedViewPanels`
- [x] 2.3 Pass `className="flex flex-col flex-1 min-h-0"` to each panel via `cloneElement` when `mode="self"`
- [x] 2.4 Verify all `TabbedViewPanels` tests pass

## 3. OutletListPage — wire onRefresh and isRefreshing

- [x] 3.1 Write failing tests in `OutletListPage.test.tsx` (or integration test):
  - connected panel receives `onRefresh` prop
  - not-connected panel receives `onRefresh` prop
  - `isRefreshing` on connected panel is `true` when `connectedQuery.isFetching && !connectedQuery.isFetchingNextPage`
  - `isRefreshing` on not-connected panel is `true` when `notConnectedQuery.isFetching && !notConnectedQuery.isFetchingNextPage`
- [x] 3.2 Add `onRefresh={() => connectedQuery.refetch()}` and `isRefreshing={connectedQuery.isFetching && !connectedQuery.isFetchingNextPage}` to the connected `TabbedView.Panel`
- [x] 3.3 Add `onRefresh={() => notConnectedQuery.refetch()}` and `isRefreshing={notConnectedQuery.isFetching && !notConnectedQuery.isFetchingNextPage}` to the not-connected `TabbedView.Panel`
- [x] 3.4 Verify all existing `OutletListPage.test.tsx` and `OutletListPage.integration.test.tsx` tests still pass

## 4. Quality gates

- [x] 4.1 Run `npm run test` in `miniapp/` — all unit tests pass
- [x] 4.2 Run `npm run test:integration` in `miniapp/` — all integration tests pass
- [x] 4.3 Run `npx prettier --write src/components/shared/TabbedView/TabbedViewPanels.tsx src/components/shared/TabbedView/TabbedViewPanel.tsx src/pages/outlets/index.tsx` from `miniapp/`
