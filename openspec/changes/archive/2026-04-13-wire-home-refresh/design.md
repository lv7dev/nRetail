## Context

`ScrollablePage` exposes an `onRefresh` prop that drives both pull-to-refresh (touch) and wheel-overscroll (desktop). The spinner lifecycle is managed inside `ScrollablePage`: it shows when `pullDistance > 0 || isRefreshing` and hides after `onRefresh()` resolves.

`home/index.tsx` imports `useHomeRefresh` and destructures `refetch`, but passes `() => console.log('refresh')` to `onRefresh` instead. The hook returns `refetch: async () => {}` — a stub ready for real query integration.

## Goals / Non-Goals

**Goals:**
- `onRefresh` on `ScrollablePage` in `HomePage` calls `refetch` from `useHomeRefresh`
- Spinner appears during the refresh cycle on both touch pull-down and wheel-overscroll

**Non-Goals:**
- Changing `ScrollablePage` internals
- Wiring real API queries into `useHomeRefresh` (separate task when queries are added)
- Changing the `isRefreshing` prop strategy (intentionally omitted while hook is a stub)

## Decisions

**Pass `refetch` directly — no wrapper needed**

`refetch` from `useHomeRefresh` is already typed as `() => Promise<void>`, matching `ScrollablePageProps.onRefresh`. No adapter, no intermediary.

Considered: keeping the console.log temporarily and adding a TODO comment. Rejected — this is a one-line fix and having the wrong wiring in committed code is a source of confusion.

## Risks / Trade-offs

- When `useHomeRefresh` is still a stub (`async () => {}`), the `await onRefresh()` resolves immediately as a microtask. React 18 batching may collapse the `pullDistance: 60 → 0` transition into a single render, meaning the spinner still won't flash visibly. This is expected and acceptable — the spinner will show naturally once real async queries are wired in. The fix is still correct because it removes the wrong wiring.
