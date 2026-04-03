## Why

The `AppLayout` header (outlet name overlay) clutters every authenticated screen with a persistent floating button that belongs contextually on the Home page only. Moving it to `QuickActionsGrid` makes it discoverable at the right moment — when the user is looking at the outlet card — and simplifies `AppLayout` to a pure layout shell. Hiding the scrollbar gives the mini app a cleaner native-app feel.

## What Changes

- **Remove outlet switcher from AppLayout**: The `div.absolute` header row in `AppLayout` is removed entirely. `AppLayout` no longer reads `useOutletStore` or `useNavigate`.
- **QuickActionsGrid header becomes the outlet switcher**: The static outlet name row in `QuickActionsGrid` becomes a full-width tappable button. Tapping navigates to `/outlets`. A `chevron-right` icon is added as a visual affordance.
- **Hide scrollbar app-wide**: `body` gets `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` in `app.css` so no scrollbar is visible in the mini app shell.

## Capabilities

### New Capabilities
- `app-shell-scroll-style`: The app shell SHALL hide the scroll indicator (scrollbar) during content scroll for a native-app feel.

### Modified Capabilities
- `outlet-context-ui`: Outlet switcher moves from `AppLayout` header to `QuickActionsGrid` header. AppLayout no longer shows or manages the outlet name. The same navigation behaviour (tap → `/outlets`, back without pick preserves outlet) now applies from the QuickActionsGrid header.

## Impact

- `miniapp/src/components/AppLayout.tsx` — remove absolute header div, `useOutletStore`, `useNavigate` imports
- `miniapp/src/components/AppLayout.test.tsx` — remove outlet name / navigate tests; add test that no outlet button exists in AppLayout
- `miniapp/src/pages/home/QuickActionsGrid.tsx` — outlet header row becomes `<button>` with `useNavigate`; add chevron-right icon
- `miniapp/src/pages/home/QuickActionsGrid.test.tsx` — add test: tapping outlet row navigates to `/outlets`
- `miniapp/src/css/app.css` — add scrollbar-hiding rules on `body`
