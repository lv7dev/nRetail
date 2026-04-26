## Why

`OutletListPage` violates the project's hooks convention by calling `outletService` directly inside `useInfiniteQuery` (pages must go through hooks, never services), and contains inline debounce logic that will need to be duplicated the moment any other search input appears in the app. Both issues are cheap to fix now before more pages build on the same pattern.

## What Changes

- Extract a generic `useDebounce<T>(value, delay)` hook to `src/hooks/useDebounce.ts`
- Extract a domain hook `useOutlets({ activeTab, searchTerm })` to `src/hooks/useOutlets.ts` that owns all TanStack Query logic for the outlets domain (two `useInfiniteQuery` calls, `confirmMembership` + `rejectMembership` mutations, cache invalidation)
- Move the `OutletTabKey` type (`'connected' | 'not-connected'`) from `index.tsx` to `src/types/outlet.ts` so both the hook and page can import it without a circular dependency
- Simplify `OutletListPage` to pure layout + render logic; it no longer touches the service layer directly

No user-visible behavior changes. No API changes.

## Capabilities

### New Capabilities

- `outlet-hooks`: The TanStack Query interface for the outlets domain — hook API, query key conventions, mutation side effects, and cache invalidation strategy

### Modified Capabilities

- `outlet-list-ui`: `OutletListPage` implementation changes (delegates data fetching to `useOutlets`), but no requirement changes — listing for completeness only

## Impact

- **New files**: `src/hooks/useDebounce.ts`, `src/hooks/useDebounce.test.ts`, `src/hooks/useOutlets.ts`, `src/hooks/useOutlets.test.ts`
- **Modified files**: `src/pages/outlets/index.tsx` (simplified), `src/types/outlet.ts` (add `OutletTabKey`)
- **Test coverage**: existing `OutletListPage` tests continue to pass unchanged; hook tests cover the extracted logic directly
- **No dependencies added**
