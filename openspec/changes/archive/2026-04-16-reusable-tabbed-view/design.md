## Context

`TabbedProductSection` in `pages/home/` is a page-specific component: hardwired i18n keys (`home` namespace), no scroll memory between tab switches, and tightly coupled — the tab bar and content list must always be DOM siblings. This makes it impossible to place the tab bar inside a `CollapsibleHeader` while keeping the content as a full-page scroll area.

The app needs a pattern that works in three layouts:
1. **Normal** — TabBar + content stacked in one place (most pages)
2. **Sticky home** — TabBar sticks under the header, content uses the outer `ScrollablePage` for scroll/load-more
3. **Header split** — TabBar lives inside `CollapsibleHeader`'s `children` slot, content is the full page scroll

## Goals / Non-Goals

**Goals:**
- Generic `TabBar` UI component usable anywhere
- `TabbedView` composite that connects `TabBar` and `Panels` via React Context — callers can place them anywhere in the tree
- Self-scroll mode: each panel has its own `ScrollablePage`; scroll position preserved natively by keeping panels mounted (`display: none` when inactive)
- Outer-scroll mode: panels delegate to an external `ScrollablePage` via ref; per-tab scroll position saved and restored
- Replace `pages/home/TabbedProductSection` with the new components

**Non-Goals:**
- Animated tab transitions / slide effects
- More than ~8 tabs (no virtualised tab bar needed)
- TabBar vertical orientation
- Changing `ScrollablePage` or `CollapsibleHeader` APIs

## Decisions

### 1. Context-based composition over prop-drilling

**Decision:** `TabbedView` wraps children in a React Context that holds `activeTab` and `onTabChange`. `TabbedView.TabBar` and `TabbedView.Panels` read from that context independently.

**Why:** The "header split" layout requires the TabBar and Panels to be in different subtrees — `CollapsibleHeader`'s `children` slot vs. `ScrollablePage`'s children. Prop-drilling would require the parent to thread callbacks through unrelated components. Context lets the parent just wrap both in `<TabbedView>` and place sub-components wherever needed.

**Alternative considered:** Controlled compound component where caller lifts `activeTab` state explicitly. Rejected — more boilerplate for callers, and the context approach still supports a controlled escape hatch via `activeTab` + `onTabChange` props on `TabbedView`.

---

### 2. Mount strategy: `display: none`, not unmount

**Decision:** All `TabbedView.Panel` children stay mounted in the DOM at all times. Inactive panels receive `style={{ display: 'none' }}`.

**Why:** The browser preserves a scroll container's `scrollTop` as long as the element stays in the DOM. This gives us free, zero-code scroll memory. No save/restore logic needed. No flash when returning to a tab (content is already rendered). IntersectionObserver on the load-more sentinel of a hidden panel won't fire — which is correct, since we only want load-more on the visible panel.

**Alternative considered:** Unmount on switch + manually save/restore `scrollTop` via a ref map. Rejected — adds code, causes a one-frame flash at `scrollTop = 0` on remount, and is fragile if the scroll container ref becomes stale.

---

### 3. Outer-scroll mode: save/restore per-tab `scrollTop`

**Decision:** `TabbedView.Panels` in `mode="outer"` maintains a `Map<tabKey, number>` ref. On tab switch:
1. Save `outerScrollRef.current.scrollTop` for the outgoing tab.
2. If the incoming tab has a saved position → restore it (`outerScrollRef.current.scrollTop = saved`).
3. If the incoming tab has no saved position (first visit) → scroll to `tabbedViewRef.current.offsetTop` so the user sees the top of the tab list with the sticky TabBar aligned.

**Why:** Restoring position lets users resume reading in a tab after switching away. This mirrors how mobile apps (Instagram, Twitter) handle tab switching. "Jump to top on every switch" loses the user's place.

**First-visit behaviour:** Scrolling to `tabbedViewRef.current.offsetTop` on first visit means the page reveals the tab content at the correct position — the sticky TabBar is at the top of the viewport and the list starts below it. A scroll to `0` would show banners, not the list.

**Alternative considered:** Always scroll to `offsetTop` on every switch. Rejected — loses reading position on return visits.

---

### 4. Component placement: `TabBar` in `ui/`, `TabbedView` in `shared/`

**Decision:** `TabBar` goes into `components/ui/` (pure UI, no app dependencies). `TabbedView` goes into `components/shared/` (uses `ScrollablePage` in self-scroll mode, which is an app-level shared component).

**Why:** Follows existing conventions — `ui/` for generic components, `shared/` for components with app-level wiring.

---

### 5. Refresh invalidates all tabs; active tab refetches immediately

**Decision:** `TabbedView.Panels` accepts a single `onRefresh` callback (for self-scroll mode). Callers use this to invalidate all tab queries (e.g., via TanStack Query `queryClient.invalidateQueries`). Because inactive panels are hidden (not unmounted), TanStack Query considers their data stale but doesn't refetch until the query is "active" (i.e., the panel is visible). Only the visible panel's query is active → it refetches immediately.

**Why:** No extra coordination logic needed. TanStack Query's active/inactive lifecycle handles the lazy-refetch-on-tab-switch behaviour naturally.

---

### 6. `TabBar` overflow: `overflow-x: auto` + `flex-1 min-w-max` per tab

**Decision:** The `TabBar` container uses `overflow-x: auto`. Each tab button uses `flex-1 min-w-max whitespace-nowrap`.

**Why:** `flex-1` distributes space equally when tabs fit in the container. `min-w-max` prevents tabs from shrinking below their natural content width — when total content width exceeds the container, the flex container overflows and the scroll bar activates. `whitespace-nowrap` ensures the label never wraps to a second line even during the flex sizing calculation.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| All panel DOMs in memory simultaneously | Acceptable — product lists are small (~10–20 items per tab) |
| `outerScrollRef.current.offsetTop` may be wrong during initial render or after layout changes | Read `offsetTop` lazily at switch time, not at mount time |
| IntersectionObserver in outer mode: the outer sentinel fires for whichever tab is active, but `onLoadMore` must fetch the right tab's data | Caller wires `onLoadMore` for the active tab; `TabbedView` does not manage per-tab load-more callbacks in outer mode — the outer `ScrollablePage`'s `onLoadMore` changes when `activeTab` changes (caller responsibility) |
| Sticky TabBar `top: 0` sticks to the top of `ScrollablePage`'s viewport — correct only when `CollapsibleHeader` is outside the scroller | Confirmed: `CollapsibleHeader` is always outside `ScrollablePage`. This assumption is documented here. |

## Migration Plan

1. Build `TabBar` component + tests
2. Build `TabbedView` + sub-components + tests
3. Replace `pages/home/TabbedProductSection` with `TabbedView` in outer-scroll mode
4. Delete `TabbedProductSection.tsx` and its test file

No API changes, no data migrations, no feature flags needed. The replacement is local to the home page.
