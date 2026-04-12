## 1. OutletContextCard — Extract and add collapsed prop

- [x] 1.1 Write failing tests for `OutletContextCard` — expanded state shows outlet name + 4 actions; collapsed state shows pill only; tap navigates to `/outlets` in both states
- [x] 1.2 Create `miniapp/src/pages/home/OutletContextCard.tsx` — extract outlet name row + quick actions from `QuickActionsGrid`, add `collapsed?: boolean` prop; pill renders outlet name + chevron only
- [x] 1.3 Update `QuickActionsGrid.tsx` to use `OutletContextCard` internally (or remove if fully replaced)
- [x] 1.4 Update `QuickActionsGrid.test.tsx` to reflect refactored structure; ensure all tests pass

## 2. CollapsibleHeader component

- [x] 2.1 Write failing tests for `CollapsibleHeader` — renders topBar/children/card slots; passes `collapsed={false}` initially; passes `collapsed={true}` after sentinel exits; passes `collapsed={false}` when sentinel re-enters
- [x] 2.2 Create `miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx` with `topBar`, `children`, `card` props; sentinel div at card bottom; IntersectionObserver on sentinel (root = scroll container via ref forwarding or context); CSS transition on `max-height`
- [x] 2.3 Create `miniapp/src/components/shared/CollapsibleHeader/index.ts` barrel export
- [x] 2.4 Export `CollapsibleHeader` from `miniapp/src/components/shared/index.ts` (or create barrel if absent)
- [x] 2.5 Verify sticky pill behavior: `position: sticky; top: [topBar+children height]` in collapsed state

## 3. ScrollablePage component

- [x] 3.1 Write failing tests for `ScrollablePage` — renders children; calls `onRefresh` after pull gesture ≥ 60px at scrollTop=0; does not call `onRefresh` when scrollTop > 0; calls `onLoadMore` when sentinel intersects + `hasMore=true` + not loading; does not call `onLoadMore` when `hasMore=false`; shows loading spinner when `isLoadingMore=true`
- [x] 3.2 Create `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — `flex:1 overflow-y:auto` container; touch event handlers for pull-to-refresh (touchstart/touchmove/touchend, 60px threshold, vertical-dominant gesture guard); IntersectionObserver on bottom sentinel for load-more; refresh indicator (CSS spinner reusing Button spinner SVG); load-more spinner at bottom
- [x] 3.3 Create `miniapp/src/components/shared/ScrollablePage/index.ts` barrel export
- [x] 3.4 Export `ScrollablePage` from `miniapp/src/components/shared/index.ts`

## 4. AppLayout — flex column layout

- [x] 4.1 Write failing test: `AppLayout` `page-content` renders as flex column so `ScrollablePage` (flex:1) fills remaining height
- [x] 4.2 Update `miniapp/src/components/AppLayout.tsx` — add `flex flex-col` to `page-content` div so `ScrollablePage` fills available height beneath `CollapsibleHeader`
- [x] 4.3 Update `AppLayout.test.tsx` to cover new flex column structure

## 5. Home page — compose CollapsibleHeader + ScrollablePage

- [x] 5.1 Write failing tests for updated `HomePage` — `CollapsibleHeader` is rendered; `OutletContextCard` is in the card slot; `ScrollablePage` wraps the content sections; `onRefresh` is wired (calls home data refetch)
- [x] 5.2 Update `miniapp/src/pages/home/index.tsx` — wrap with `CollapsibleHeader` (topBar: AppHeader, children: SearchBar, card: OutletContextCard) + `ScrollablePage` (onRefresh wired to a `useHomeRefresh` hook or inline refetch)
- [x] 5.3 Create `miniapp/src/pages/home/useHomeRefresh.ts` — returns `refetch` function that re-fetches home data (stub for now; wire real queries as they are added)
- [x] 5.4 Update `miniapp/src/pages/home/index.test.tsx` to cover new composition

## 6. Final checks

- [x] 6.1 Run `npm run test` in `miniapp/` — all unit tests pass
- [x] 6.2 Run `npm run test:coverage` — 100% threshold maintained
- [ ] 6.3 Visual smoke test: scroll down on home page → card collapses to pill; scroll up → expands; pull down → refresh indicator appears
