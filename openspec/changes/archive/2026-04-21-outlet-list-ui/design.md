## Context

`OutletListPage` currently renders a simple flat list of the user's connected outlets from `GET /outlets/mine`. The new design introduces a tabbed interface (Connected / Not connected), shared search bar, and infinite scroll — matching the product mockups. The backend `GET /outlets?connected&q&cursor` endpoint is deferred; the frontend must stub the service layer cleanly so it can be wired up without a page rewrite.

## Goals / Non-Goals

**Goals:**
- Redesign `OutletListPage` to match the design mockups exactly
- Both tabs use server-side search + infinite scroll via `useInfiniteQuery`
- `OutletItem` component encapsulates the item layout and contextual actions
- Outlet type gains `code` and `imageUrl` with no breaking changes (both optional)
- Clean service stub so the backend endpoint can be wired in a separate change

**Non-Goals:**
- Backend implementation of `GET /outlets?connected&q&cursor` (separate change)
- The "Connect" button action (no API exists yet — button renders but is inert)
- "Not My Outlet" action (informational label only for now)
- Pagination of the current `GET /outlets/mine` endpoint

## Decisions

### Decision: Single unified `getOutlets()` service method

**Chosen:** `outletService.getOutlets({ connected, q, cursor })` — one method, `connected` boolean switches the data set.

**Alternative considered:** Two separate methods (`getMyOutlets`, `getAvailableOutlets`). Rejected because it duplicates pagination/search logic and requires two MSW handler stubs. The single method mirrors the intended single backend endpoint.

**Migration:** `getMyOutlets()` is removed; the single call site (`OutletListPage`) migrates to `getOutlets({ connected: true })`.

---

### Decision: Mode 3 layout — tab bar inside CollapsibleHeader, panels below

**Chosen:** `TabbedView.TabBar` lives inside `CollapsibleHeader`'s `children` slot (red background zone). `TabbedView.Panels mode="self"` sits below as the scrollable content. This is Mode 3 from the `TabbedView` component docs.

```
<TabbedView>
  <CollapsibleHeader topBar={<AppHeader />} decoration={<wave />}>
    <TabbedView.TabBar />         ← red zone
  </CollapsibleHeader>
  <SearchBar />                   ← white bg, shared, non-scrollable
  <TabbedView.Panels mode="self">
    <TabbedView.Panel tabKey="connected">...</TabbedView.Panel>
    <TabbedView.Panel tabKey="not-connected">...</TabbedView.Panel>
  </TabbedView.Panels>
</TabbedView>
```

**Alternative considered:** Tab bar at page content level (above a plain white area). Rejected — the design mockups clearly show the tab bar inside the red header zone.

**Benefit:** Scroll position, load-more state, and query cache are fully independent per tab. No shared scroll container needed.

---

### Decision: Search bar placed between header and panels (non-scrollable, shared)

**Chosen:** The search bar renders between `CollapsibleHeader` and `TabbedView.Panels` — outside both. It sits on a white background, never scrolls away, and is shared across both tabs. The debounced value flows into both tabs' `queryKey`.

**Alternative considered:** Search bar inside each panel (top of scroll area). Rejected — it would scroll out of view and require duplication in each panel.

---

### Decision: Back arrow shown conditionally via `location.key`

**Chosen:** `location.key !== 'default'` determines whether the back arrow renders. React Router sets `location.key = 'default'` only on the initial app boot navigation — any subsequent push sets a unique key. When visible, the arrow calls `navigate(-1)`.

**Why:** On first login the user lands directly on `/outlets` with no prior route — no back arrow. When navigating from the home page (or any future entry point), the arrow appears automatically without needing explicit state to be passed.

**Alternative considered:** Passing `{ state: { canGoBack: true } }` on every `navigate('/outlets')` call. Rejected — fragile, requires updating every call site when new entry points are added.

---

### Decision: Debounced search with shared state, separate query keys

The search input value is held in a `useState` at the page level and debounced (300 ms) before being put into each tab's `queryKey`. Changing the search term resets both `useInfiniteQuery` hooks to page 1 automatically because the query key changes.

```
searchTerm (state) → debounced → queryKey: ['outlets', { connected, q: debounced }]
```

---

### Decision: Cursor-based pagination shape (frontend contract)

The frontend assumes the backend will return:
```ts
{
  data: Outlet[]
  meta: { nextCursor: string | null }
}
```
`useInfiniteQuery` uses `meta.nextCursor` as `pageParam` for the next fetch. `hasMore` is `nextCursor !== null`. The stub returns an empty list with `nextCursor: null` until the backend lands.

---

### Decision: `imageUrl` rendered with `<img>` + initials fallback

When `imageUrl` is absent or fails to load, the avatar shows the outlet's name initials on a neutral background — matching the pattern used elsewhere in the app. No external avatar library needed.

## Risks / Trade-offs

- **Backend stub returns empty not-connected list** → the "Not connected" tab will be empty until the backend lands. This is acceptable; the UI and infinite-scroll wiring are testable with the stub.
- **`getMyOutlets()` removal** → only used in `OutletListPage`. Removing it eliminates dead code but must be done atomically with the page rewrite to avoid a broken intermediate state.
- **100% coverage enforcement** → `OutletItem` and the updated `OutletListPage` require full test coverage. Plan for unit tests covering all render branches (with/without imageUrl, connected/not-connected actions).
