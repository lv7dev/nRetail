## 1. Outlet Type Extension

- [x] 1.1 Add `code?: string | null` and `imageUrl?: string | null` to `Outlet` interface in `miniapp/src/types/outlet.ts`
- [x] 1.2 Update MSW outlet fixtures in `miniapp/src/mocks/handlers/outlets.ts` to include `code` and `imageUrl` fields

## 2. Outlet Service

- [x] 2.1 Write failing tests for `outletService.getOutlets({ connected, q, cursor })` in a new integration test
- [x] 2.2 Replace `getMyOutlets()` with `getOutlets({ connected, q, cursor })` in `outletService.ts` — calls `GET /outlets` with query params; returns `{ data: Outlet[], meta: { nextCursor: string | null } }`
- [x] 2.3 Add MSW handler for `GET /outlets` with `connected`, `q`, `cursor` params (stub returning seeded data + `nextCursor: null`)

## 3. OutletItem Component

- [x] 3.1 Write failing unit tests for `OutletItem` covering: avatar with imageUrl, initials fallback, code display, connected mode (no actions), not-connected mode (label + Connect button)
- [x] 3.2 Implement `OutletItem` component at `miniapp/src/pages/outlets/OutletItem.tsx` — avatar, name, code, address, contextual actions via `connected` prop
- [x] 3.3 Add i18n keys for "Not My Outlet" label and "Connect" button to `locales/vi/outlets.json` and `locales/en/outlets.json`

## 4. OutletListPage Redesign

- [x] 4.1 Write failing unit tests for `OutletListPage`: tab switching, search input, auto-forward suppressed during search, empty state only when no search term, no-results state when searching with no results
- [x] 4.2 Write failing integration tests for `OutletListPage`: Connected tab loads via `GET /outlets?connected=true`, Not-connected tab loads via `GET /outlets?connected=false`, search param sent after debounce, load-more triggers next page fetch
- [x] 4.3 Implement `OutletListPage` redesign — `TabbedView` (self mode), debounced search state, `useInfiniteQuery` per tab, `ScrollablePage` with `onLoadMore`/`hasMore` per panel
- [x] 4.4 Add i18n keys for tab labels, search placeholder, empty state, and no-results message to `locales/vi/outlets.json` and `locales/en/outlets.json`

## 5. Back Arrow Navigation

- [x] 5.1 Write failing unit test for `OutletListPage` back arrow: renders when `location.key !== 'default'`, hidden when `location.key === 'default'`, calls `navigate(-1)` on tap
- [x] 5.2 Implement conditional back arrow in `OutletListPage` — use `useLocation().key !== 'default'` to show/hide, `navigate(-1)` on tap

## 6. Verification

- [x] 6.1 Run `npm run test` in `miniapp/` — all unit tests pass
- [x] 6.2 Run `npm run test:integration` in `miniapp/` — all integration tests pass
- [x] 6.3 Run `npm run test:coverage` — 100% coverage maintained
- [x] 6.4 Run `npx prettier --write` on all modified files
