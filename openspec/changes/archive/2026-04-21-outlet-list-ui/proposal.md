## Why

The current outlet list page is a plain unstyled list that only shows outlets the user is already connected to. The product design calls for a tabbed interface distinguishing connected vs. not-yet-connected outlets, with search and infinite scroll so sales reps can discover and connect to new outlets directly from the app.

## What Changes

- **Extend `Outlet` type** with two new optional fields: `code` (e.g. `CU000014603`) and `imageUrl` (outlet avatar/thumbnail)
- **Replace `GET /outlets/mine`** usage with a unified `GET /outlets?connected=true|false&q=...&cursor=...` endpoint that covers both tabs with the same query shape (backend contract defined here; implementation in a future backend change)
- **Redesign `OutletListPage`** with:
  - Red header background matching the design mockups
  - Pill-style tab bar: **Connected** / **Not connected**
  - Shared search bar (server-side, debounced) above the tabs
  - Infinite scroll on both tabs via `useInfiniteQuery`
- **New `OutletItem` component** showing outlet avatar, name, code, address, and contextual actions:
  - Connected tab: no extra actions (outlet already linked)
  - Not connected tab: "Not My Outlet" informational label + **Connect** button
- **New `outletService.getOutlets()`** method replacing `getMyOutlets()` with pagination and search params

## Capabilities

### New Capabilities
- `outlet-list-ui`: Tabbed outlet list page UI — Connected/Not-connected tabs, search bar, infinite scroll, OutletItem component with contextual actions

### Modified Capabilities
- `outlet-data-model`: Outlet type gains `code?: string` and `imageUrl?: string` fields
- `outlet-api`: New unified `GET /outlets?connected&q&cursor` replaces `GET /outlets/mine`; response items include nullable `role` (null when not connected)
- `outlet-selection-flow`: OutletListPage behavior changes — list is now tabbed with infinite scroll; auto-forward on single outlet and empty state remain unchanged

## Impact

- `miniapp/src/types/outlet.ts` — add `code`, `imageUrl` fields
- `miniapp/src/services/outletService.ts` — replace `getMyOutlets()` with `getOutlets({ connected, q, cursor })`
- `miniapp/src/pages/outlets/index.tsx` — full redesign
- `miniapp/src/pages/outlets/OutletItem.tsx` — new component
- `miniapp/src/locales/vi/outlets.json` + `en/outlets.json` — new i18n keys
- `miniapp/src/mocks/handlers/outlets.ts` — update MSW handlers for new endpoint shape
- Backend: `GET /outlets` endpoint with `connected`, `q`, `cursor` params (deferred to separate backend change)
