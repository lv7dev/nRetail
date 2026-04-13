## 1. Fix ScrollablePage touch handler

- [x] 1.1 In `ScrollablePage.tsx`, change `handleTouchEnd` to `async` and move `setPullDistance(0)` to after `await onRefresh()` (mirror the `handleWheel` pattern)
- [x] 1.2 Update `ScrollablePage.test.tsx`: add a test that the spinner remains visible until `onRefresh()` resolves (use a deferred promise to control timing)

## 2. Extend useHomeRefresh

- [x] 2.1 In `useHomeRefresh.ts`, add local `isRefreshing` state: set to `true` at start of `refetch`, `false` after it resolves; return `{ refetch, isRefreshing }`
- [x] 2.2 Update `useHomeRefresh.test.ts`: test that `isRefreshing` is `true` while `refetch` is running and `false` after it settles

## 3. Wire isRefreshing in HomePage

- [x] 3.1 In `home/index.tsx`, destructure `isRefreshing` from `useHomeRefresh()` and pass `isRefreshing={isRefreshing}` to `<ScrollablePage>`
- [x] 3.2 Update `home/index.test.tsx`: assert that `isRefreshing` from `useHomeRefresh` is forwarded to `ScrollablePage`
