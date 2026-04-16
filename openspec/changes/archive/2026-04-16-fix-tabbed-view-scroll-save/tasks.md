## 1. Failing Tests (RED)

- [x] 1.1 In `TabbedView.test.tsx`, add a test: switching away from a tab after load-more added content saves the pre-clamp scroll position (simulate by setting `lastKnownScrollTopRef` via a scroll event on the container, then switching tabs — verify the saved position matches the scroll event value, not a clamped lower value)
- [x] 1.2 In `TabbedView.test.tsx`, add a test: the scroll listener is not attached in `mode="self"`

## 2. Implementation

- [x] 2.1 In `TabbedViewPanels.tsx`, add `lastKnownScrollTopRef = useRef(0)`
- [x] 2.2 In `TabbedViewPanels.tsx`, add a `useEffect` that attaches a passive `scroll` listener on `outerScrollRef.current` (only when `mode === 'outer'`), writing `element.scrollTop` into `lastKnownScrollTopRef.current`; clean up on unmount or ref change
- [x] 2.3 In `TabbedViewPanels.tsx`, in the `useLayoutEffect` save step, replace `outerScrollElement.scrollTop` with `lastKnownScrollTopRef.current`

## 3. Spec Amendment

- [x] 3.1 In `openspec/changes/reusable-tabbed-view/specs/tabbed-view/spec.md`, amend the "Outer mode saves per-tab scrollTop on tab switch" requirement to match the updated wording in this change's spec

## 4. Verification

- [x] 4.1 Run `npm run test` in `miniapp/` — all tests pass
- [ ] 4.2 Manual smoke test: home page → scroll bought tab to product 23 → switch to viewed → switch back to bought → verify product 23 is visible (not product 15)
