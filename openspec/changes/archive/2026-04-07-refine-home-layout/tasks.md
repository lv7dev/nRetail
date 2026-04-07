## 1. QuickActionsGrid outlet switcher

- [x] 1.1 Write failing test: tapping the outlet header row navigates to `/outlets`
- [x] 1.2 Write failing test: a `chevron-right` icon is rendered in the outlet header row
- [x] 1.3 Convert the outlet header `div` to a `<button type="button">` with `useNavigate` calling `/outlets` on click
- [x] 1.4 Add `chevron-right` icon to the right of the outlet header row

## 2. AppLayout simplification

- [x] 2.1 Write failing test: `AppLayout` renders no button or element with the outlet name
- [x] 2.2 Remove the `div.absolute` header row from `AppLayout.tsx`
- [x] 2.3 Remove `useOutletStore`, `useNavigate` imports from `AppLayout.tsx`
- [x] 2.4 Remove outlet-related tests from `AppLayout.test.tsx` (shows outlet name, tapping navigates)

## 3. Hide scrollbar

- [x] 3.1 Add `body { scrollbar-width: none; }` and `body::-webkit-scrollbar { display: none; }` to `app.css`
