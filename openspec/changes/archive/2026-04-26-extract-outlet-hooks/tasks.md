## 1. Type and shared foundations

- [x] 1.1 Move `OutletTabKey` type (`'connected' | 'not-connected'`) from `src/pages/outlets/index.tsx` to `src/types/outlet.ts`
- [x] 1.2 Update `src/pages/outlets/index.tsx` to import `OutletTabKey` from `@/types/outlet`

## 2. useDebounce hook

- [x] 2.1 Write failing test in `src/hooks/useDebounce.test.ts` covering: delayed update, rapid-change deduplication, cleanup on unmount
- [x] 2.2 Implement `useDebounce<T>(value: T, delay: number): T` in `src/hooks/useDebounce.ts`
- [x] 2.3 Verify all `useDebounce` tests pass

## 3. useOutlets hook

- [x] 3.1 Write failing tests in `src/hooks/useOutlets.test.ts` covering: connected query enabled only on connected tab, not-connected query enabled only on not-connected tab, flattened outlet arrays returned, `hasSearch` flag, `handleMembershipAction('confirm')` invalidates both query groups, `handleMembershipAction('reject')` invalidates only not-connected
- [x] 3.2 Implement `useOutlets({ activeTab, searchTerm })` in `src/hooks/useOutlets.ts` with the two `useInfiniteQuery` calls, `flattenPages` internal helper, both mutations, `invalidateOutletQuery` internal helper, and `handleMembershipAction`
- [x] 3.3 Verify all `useOutlets` tests pass

## 4. Simplify OutletListPage

- [x] 4.1 Replace inline debounce logic in `src/pages/outlets/index.tsx` with `useDebounce(searchTerm.trim(), 300)`
- [x] 4.2 Replace the two `useInfiniteQuery` calls, both mutations, `invalidateOutletQuery`, and `handleMembershipAction` in `index.tsx` with a single `useOutlets({ activeTab, searchTerm: debouncedSearchTerm })` call
- [x] 4.3 Remove `flattenPages` from `index.tsx` (it moved into the hook)
- [x] 4.4 Verify all existing `OutletListPage.test.tsx` and `OutletListPage.integration.test.tsx` tests still pass unchanged

## 5. Quality gates

- [x] 5.1 Run `npm run test` in `miniapp/` — all unit tests pass
- [x] 5.2 Run `npm run test:integration` in `miniapp/` — all integration tests pass
- [x] 5.3 Run `npx prettier --write src/hooks/useDebounce.ts src/hooks/useOutlets.ts src/types/outlet.ts src/pages/outlets/index.tsx` from `miniapp/`
