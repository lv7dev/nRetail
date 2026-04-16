## 1. Failing Test (RED)

- [x] 1.1 In `ScrollablePage.test.tsx`, add a test: when a descendant component reads `scrollContainerRef.current` in a `useEffect`, it finds the element set (not null) — verify the ref is assigned during the layout phase

## 2. Implementation

- [x] 2.1 In `ScrollablePage.tsx`, change `useEffect` to `useLayoutEffect` for the `scrollContainerRef` assignment (one-word change)
- [x] 2.2 Add `useLayoutEffect` to the import list in `ScrollablePage.tsx` (remove `useEffect` if no longer needed elsewhere)

## 3. Verification

- [x] 3.1 Run `npm run test` in `miniapp/` — all tests pass
- [ ] 3.2 Manual smoke test: home page → scroll bought tab past load-more to product 23 → switch to viewed → switch back to bought → verify product 23 is visible (not top of page)
