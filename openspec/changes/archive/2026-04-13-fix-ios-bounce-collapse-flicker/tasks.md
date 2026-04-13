## 1. Tests — hysteresis band

- [x] 1.1 Update existing test "emits onCollapsedChange(true) when scrolled down" — change scroll position from any `> 0` value to `>= 20` to match new threshold
- [x] 1.2 Update existing test "emits onCollapsedChange(false) when back at top" — verify it still uses `scrollTop = 0` (no change needed, confirm it passes)
- [x] 1.3 Add test: `scrollTop = 1` → `onCollapsedChange` NOT called
- [x] 1.4 Add test: `scrollTop = 19` → `onCollapsedChange` NOT called (dead zone upper boundary)
- [x] 1.5 Add test: `scrollTop = 20` → `onCollapsedChange(true)` called (threshold boundary)
- [x] 1.6 Add test: oscillation sequence `0 → 3 → 0 → 2 → 0` → `onCollapsedChange` called with `false` on each `0` but never with `true` (bounce simulation)
- [x] 1.7 Add test: deduplication — scroll from `30` to `50` to `80` (all above threshold, all already collapsed) → `onCollapsedChange` called only once total

## 2. Implementation — Part A: CSS

- [x] 2.1 Add `overscroll-y-contain` Tailwind class to the root `<div>` in `ScrollablePage` (alongside existing `min-h-0 flex-1 overflow-y-auto`)

## 3. Implementation — Part B: hysteresis logic

- [x] 3.1 Add `const COLLAPSE_THRESHOLD_PX = 20` as a module-level constant above the `ScrollablePage` component
- [x] 3.2 Add `const lastCollapsedRef = useRef<boolean>(false)` inside `ScrollablePage`
- [x] 3.3 Replace the `handleScroll` body with hysteresis logic:
  - Compute `scrollTop` from `event.currentTarget.scrollTop`
  - Derive `next: boolean | null` — `false` if `scrollTop === 0`, `true` if `scrollTop >= COLLAPSE_THRESHOLD_PX`, `null` (dead zone) otherwise
  - Only call `onCollapsedChange(next)` when `next !== null && next !== lastCollapsedRef.current`
  - Update `lastCollapsedRef.current = next` when emitting

## 4. Verification

- [ ] 4.1 Run `npm run test` in `miniapp/` — all tests green including updated and new ones
- [x] 4.2 Run `npx prettier --write miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx`
- [ ] 4.3 Manual check on iOS device or Safari simulator: fling up strongly from a scrolled position — card should expand once and stay expanded, no flicker
- [ ] 4.4 Manual check normal scroll: scroll down past 20px — card collapses promptly; scroll back to top — card expands promptly
