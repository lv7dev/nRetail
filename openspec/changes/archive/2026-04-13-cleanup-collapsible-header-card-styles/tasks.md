## 1. Update CollapsibleHeader tests (RED)

- [x] 1.1 Add a test: rendering without `card` prop should NOT have `pb-8` or `rounded-b-3xl` on the topZone element
- [x] 1.2 Add a test: rendering with a `card` prop should have `pb-8` and `rounded-b-3xl` on the topZone element
- [x] 1.3 Verify existing tests still pass (collapsed/expanded card behavior unchanged)

## 2. Remove dead sticky/stickyTop code

- [x] 2.1 Delete `stickyTop` state declaration (`const [stickyTop, setStickyTop] = useState(0)`)
- [x] 2.2 Delete the ResizeObserver `useEffect` that computes and sets `stickyTop`
- [x] 2.3 Remove `style={resolvedCollapsed ? { top: \`${stickyTop}px\` } : undefined}` from the card shell div
- [x] 2.4 Replace `sticky` class in the collapsed card shell className with `relative` (consistent with expanded state)

## 3. Guard card-specific topZone styles

- [x] 3.1 Extract `pb-8 rounded-b-3xl` from the topZone `className` string into a conditional that only applies when `renderedCard !== null`
- [x] 3.2 Verify `bg-primary` remains unconditional on the topZone

## 4. Verify and format

- [x] 4.1 Run `npm run test` in `miniapp/` — all tests green
- [x] 4.2 Run `npx prettier --write miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx`
- [x] 4.3 Visual check: home page still shows card overlap effect; a card-less header (if one exists) has no extra bottom gap
