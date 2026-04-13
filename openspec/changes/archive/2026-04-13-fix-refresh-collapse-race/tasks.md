## 1. Tests — Bug 1: passive touchmove guard

- [x] 1.1 Add test: while `pullingRef` is active, a simulated `touchmove` event on the container calls `preventDefault()`
- [x] 1.2 Add test: while `pullingRef` is NOT active, a simulated `touchmove` event does NOT call `preventDefault()`
- [x] 1.3 Add test: `onCollapsedChange` is NOT called during an active pull gesture (verify `handleScroll` is not emitting collapse while pulling)

## 2. Tests — Bug 2: wheel arrive guard

- [x] 2.1 Add test: `onRefresh` is NOT called when wheel fires within 400 ms of `scrollTop` transitioning to `0`
- [x] 2.2 Add test: `onRefresh` IS called when wheel fires after 400 ms have elapsed since `scrollTop` hit `0`
- [x] 2.3 Add test: `onRefresh` IS called when page mounts at `scrollTop === 0` and wheel fires (no prior scroll-to-top, `arrivedAtTopRef` is null)

## 3. Implementation — Bug 1: passive:false imperative listener

- [x] 3.1 Add `arrivedAtTopRef` ref: `const arrivedAtTopRef = useRef<number | null>(null)` in `ScrollablePage`
- [x] 3.2 Add `useEffect` that attaches an imperative `touchmove` listener to `internalRef.current` with `{ passive: false }`: calls `e.preventDefault()` when `pullingRef.current` is true; cleans up on unmount; re-runs when `onRefresh` changes (skip attachment when `onRefresh` is undefined)
- [x] 3.3 Verify the `useEffect` dependency array includes `onRefresh` and nothing else (the handler only reads `pullingRef` — a ref, not state)

## 4. Implementation — Bug 2: wheel arrive guard

- [x] 4.1 In `handleScroll`: when `event.currentTarget.scrollTop === 0`, set `arrivedAtTopRef.current = performance.now()`
- [x] 4.2 In `handleWheel`: at the top of the guard block, compute `const elapsed = performance.now() - (arrivedAtTopRef.current ?? -Infinity)` and `if (elapsed < 400) return`
- [x] 4.3 Define `const WHEEL_SETTLE_MS = 400` as a module-level named constant above the component (makes the magic number visible and easy to tune)

## 5. Verification

- [x] 5.1 Run `npm run test` in `miniapp/` — all tests green including new ones
- [x] 5.2 Run `npx prettier --write miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx`
- [ ] 5.3 Manual check (mobile/touch): pull down at top — card stays expanded, pull indicator grows, refresh fires on release, card remains expanded until user scrolls
- [ ] 5.4 Manual check (mobile/touch): scroll down (card collapses), scroll back to top (card expands), immediately pull — verify pull indicator shows, no simultaneous collapse
- [ ] 5.5 Manual check (desktop wheel): scroll down, wheel back to top — verify card expands smoothly with no accidental refresh; wait ~500 ms then wheel up — verify refresh fires
