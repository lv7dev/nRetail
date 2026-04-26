## Context

`OutletListPage` (`src/pages/outlets/index.tsx`) currently violates the project's layering rule: pages must call hooks, not services. It calls `outletService` directly inside two `useInfiniteQuery` bodies. It also owns inline debounce logic (a `useState` + `useEffect` pair) that is not outlet-specific.

The project already has `src/hooks/useAuth.ts` as the established pattern for domain hooks. The hooks CLAUDE.md says: "Pages and components call hooks — never `authService` or `apiClient` directly."

## Goals / Non-Goals

**Goals:**
- Move all TanStack Query logic for outlets into `src/hooks/useOutlets.ts`
- Extract a generic `useDebounce<T>` hook to `src/hooks/useDebounce.ts`
- Leave `OutletListPage` with only UI state + render logic
- No behavior changes

**Non-Goals:**
- Changing the outlet list UI or UX
- Adding pagination strategies or new query features
- Changing any API contract

## Decisions

### 1. Hook location: `src/hooks/` (not co-located with the page)

`useOutlets` goes into `src/hooks/useOutlets.ts` alongside `useAuth.ts`.

**Alternatives considered:**
- `src/pages/outlets/useOutlets.ts` — co-location works when a hook is purely page-private. But outlet queries will be needed by future pages (outlet detail, `OutletGuard`, account page) — the domain will grow. Placing it in `hooks/` keeps it accessible without moving it later.

### 2. `useOutlets` accepts `{ activeTab, searchTerm }` as parameters

The hook receives the two pieces of page state it needs rather than managing them internally.

**Why:** `activeTab` and `searchTerm` are UI state that drives which tab is visible and what text is typed. They belong to the page. The hook only needs to know their current values to build the right query key and `enabled` flag. Keeping state in the page also makes testing the hook straightforward — callers control inputs.

### 3. `OutletTabKey` type moves to `src/types/outlet.ts`

Both `useOutlets.ts` and `index.tsx` reference `OutletTabKey`. Defining it in the hook and importing into the page, or vice versa, creates an awkward dependency direction. `src/types/outlet.ts` already holds the `Outlet` domain type — adding a tab key type there is natural.

### 4. `flattenPages` stays inside `useOutlets.ts` as an internal helper

The function flattens TanStack Query's `InfiniteData<{ data: Outlet[] }>` structure. It is specific to outlet pagination — not a generic utility. Exposing it from `utils/` would over-generalize a helper that carries type assumptions about the outlet response shape.

### 5. `useDebounce<T>(value: T, delay: number): T` — caller owns raw state

The hook only returns the debounced value. The caller (`OutletListPage`) continues to hold `searchTerm` state and passes `searchTerm.trim()` as the value. This matches the most common React debounce hook pattern and keeps the hook side-effect free (no internal `useState` for the raw input).

### 6. `useOutlets` returns flattened outlet arrays, not raw page objects

Flattening is always needed before rendering. Returning `connectedOutlets: Outlet[]` directly removes the `flattenPages(connectedQuery.data?.pages)` call from the page and makes the hook's return value easier to test.

## Risks / Trade-offs

- **Test migration risk** → Low. Existing `OutletListPage` tests mock `outletService` at the service layer — they continue to work unchanged since the service layer isn't moving. New hook tests will cover the extracted logic directly.
- **Type coupling** → Moving `OutletTabKey` to `types/outlet.ts` is a one-way door (anything could start using it). Acceptable — it is a domain concept.
- **Hook grows over time** → `useOutlets.ts` will collect more queries/mutations as the outlet domain expands. Monitor for splitting signals (separate files per concern) but no action needed now.
