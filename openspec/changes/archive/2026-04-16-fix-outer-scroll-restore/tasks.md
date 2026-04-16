## 1. Fix TabbedViewPanels scroll restoration

- [x] 1.1 Remove the leftover `console.log` debug statement (lines 26–28 of `TabbedViewPanels.tsx`)
- [x] 1.2 Replace `useEffect` with `useLayoutEffect` for the outer-scroll position logic — import `useLayoutEffect` from React and swap the hook name
- [x] 1.3 Replace the `panelsRef.current?.offsetTop ?? 0` fallback with the `getBoundingClientRect()`-based calculation: `outerScrollElement.scrollTop + panelsRef.current.getBoundingClientRect().top - outerScrollElement.getBoundingClientRect().top`

## 2. Update tests

- [x] 2.1 Update the existing test "saves outgoing outer scroll position, restores visited tabs, and scrolls first visits to offsetTop" in `TabbedView.test.tsx` — replace the `Object.defineProperty(HTMLElement.prototype, 'offsetTop', ...)` mock with a `getBoundingClientRect` mock on both the outer scroll element and the panels element, and update the expected scroll value to match the new formula
- [x] 2.2 Run `npm run test` in `miniapp/` — all tests must pass
