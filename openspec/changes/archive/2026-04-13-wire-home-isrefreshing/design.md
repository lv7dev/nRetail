## Context

`ScrollablePage` has two mechanisms to show the refresh spinner:
1. `pullDistance > 0` — visual feedback during the touch gesture (finger still down)
2. `isRefreshing={true}` — external control to keep spinner alive while loading

Current state:
- `handleTouchEnd` calls `setPullDistance(0)` before `onRefresh()` — spinner vanishes on finger lift
- `useHomeRefresh` returns only `{ refetch }` — no `isRefreshing` flag
- `HomePage` passes no `isRefreshing` prop — `ScrollablePage` defaults to `false`

## Goals / Non-Goals

**Goals:**
- Spinner stays visible from finger-lift through the end of the refresh cycle
- `useHomeRefresh` exposes `isRefreshing` so `HomePage` can forward it
- `handleTouchEnd` awaits `onRefresh()` before clearing `pullDistance` (belt-and-suspenders, covers desktop wheel too)

**Non-Goals:**
- Wiring real TanStack Query calls into `useHomeRefresh` (separate concern, tracked when queries are added)
- Changing `ScrollablePage`'s public API shape (props are unchanged)

## Decisions

**Fix `handleTouchEnd` to await `onRefresh()` before clearing `pullDistance`**

Mirrors the existing `handleWheel` pattern. Without this, even with `isRefreshing` wired, there is a one-frame flash where `pullDistance = 0` and `isRefreshing` hasn't updated yet (React state update is async).

```
Before: setPullDistance(0) → void onRefresh()
After:  await onRefresh() → setPullDistance(0)
```

Considered: leaving `handleTouchEnd` as-is and relying solely on `isRefreshing`. Rejected — the one-frame gap creates a visible flicker and the fix is trivial.

**`useHomeRefresh` stub uses local `useState` for `isRefreshing`**

Since there's no real query yet, `refetch` sets a local `isRefreshing` flag to `true`, awaits the stub, then sets it to `false`. This gives the correct external contract (`isRefreshing` transitions true → false) without a real network call, so `HomePage` and its tests can be wired correctly today.

```ts
const [isRefreshing, setIsRefreshing] = useState(false);
const refetch = async () => {
  setIsRefreshing(true);
  await Promise.resolve(); // stub — replace with real query.refetch()
  setIsRefreshing(false);
};
return { refetch, isRefreshing };
```

Considered: returning `isRefreshing: false` as a constant. Rejected — the consumer would be wired to a value that never changes; tests would not cover the live transition.

## Risks / Trade-offs

- [Risk] `handleTouchEnd` becomes async — React synthetic events don't persist across async boundaries. → Mitigation: the touch values needed (`pullDistance`, `pullingRef`) are captured before the `await`, so this is safe.
- [Risk] Stub `isRefreshing` flickers briefly even with no real data. → Acceptable — it confirms the wiring works and will be replaced by real query state.
