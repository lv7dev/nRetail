# Shared Components

App-specific shared components used across multiple pages or layouts. Unlike `ui/`, these components are allowed to reference app state (stores, hooks) directly.

## Components

| Component           | Purpose                                                                                                                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BottomNav`         | Fixed bottom navigation bar for authenticated pages — renders the 5 main routes using icons + i18n labels from `common.nav.*`                                                                                                                                                                              |
| `CollapsibleHeader` | Header zone with `topBar`, `children`, and `card` slots. The `card` collapses to a compact pill when the user scrolls down (scroll-driven via `onCollapsedChange` from `ScrollablePage`) and re-expands on scroll up. Card-overlap spacing is only applied when a card is present.                         |
| `LanguageSwitcher`  | Dropdown to switch i18n language (VI / EN). Reads `i18n.language`, calls `i18n.changeLanguage`                                                                                                                                                                                                             |
| `OutletGuard`       | Route guard: redirects to `/outlets` if no outlet selected in `useOutletStore`; renders outlet otherwise. Sits between `ProtectedRoute` and `AppLayout`                                                                                                                                                    |
| `ProtectedRoute`    | Route guard: renders `null` while `!isReady`, redirects to `/login` if no user, renders outlet otherwise                                                                                                                                                                                                   |
| `ScrollablePage`    | Full-height scroll container (`flex:1 overflow-y:auto`). Provides pull-to-refresh (touch events, 60px threshold) and infinite load-more (IntersectionObserver on bottom sentinel). Calls `onRefresh`, `onLoadMore`, and `onCollapsedChange` callbacks; data fetching stays in the page via TanStack Query. |
| `TabbedView`        | Context-driven tab switcher with per-tab scroll memory. Connects `TabbedView.TabBar`, `TabbedView.Panels`, and `TabbedView.Panel` via React Context so they can be placed anywhere in the component tree. Supports self-scroll (each panel owns a `ScrollablePage`) and outer-scroll (delegates to an external scroll container with per-tab position save/restore). |
| `ThemeSwitcher`     | Dropdown to switch theme preference (Light / System / Dark). Reads + writes `useThemeStore`. Pattern mirrors `LanguageSwitcher`                                                                                                                                                                            |

## CollapsibleHeader

```tsx
<CollapsibleHeader
  topBar={<AppHeader title="..." />}   // always visible, sits at the very top
  card={<OutletContextCard />}         // receives collapsed prop automatically via cloneElement
  scrollContainerRef={ref}             // ref to the ScrollablePage container
  collapsed={collapsed}                // controlled mode — driven by ScrollablePage onCollapsedChange
  cardOverlap={32}                     // default: 32 — px the card peeks into the topZone
  cardRadius="rounded-b-3xl"           // default: 'rounded-b-3xl' — topZone bottom radius class
  className="pb-4"                     // forwarded to outermost wrapper via cn()
>
  <SearchBar />  // rendered inside the primary bg zone, above the card
</CollapsibleHeader>
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `topBar` | `ReactNode` | — | Always-visible top row (e.g. `AppHeader`) |
| `children` | `ReactNode` | — | Content rendered inside the primary bg zone below topBar |
| `card` | `ReactElement` | — | Collapsible card; receives `collapsed` injected via `cloneElement` |
| `decoration` | `ReactNode` | — | Absolutely-positioned background visual behind topBar/children |
| `collapsed` | `boolean` | — | Controlled collapse state; omit to use internal IntersectionObserver |
| `scrollContainerRef` | `MutableRefObject<HTMLElement \| null>` | — | Scroll container ref; used as IntersectionObserver root in uncontrolled mode |
| `cardOverlap` | `number` | `32` | Pixels the card peeks into the topZone; drives `paddingBottom` on topZone and `marginTop` on card shell (both as inline styles) |
| `cardRadius` | `string` | `'rounded-b-3xl'` | Tailwind `rounded-b-*` class applied to the topZone when a card is present |
| `className` | `string` | — | Extra classes forwarded to the outermost wrapper div |

**Key implementation notes:**

- The `card` element receives `collapsed: boolean` injected via `cloneElement` — the card component must accept and handle this prop.
- Works in both **controlled** (`collapsed` prop) and **uncontrolled** (internal `IntersectionObserver` on sentinel) modes.
- **Recommended usage**: Use controlled mode (pass `collapsed` + `scrollContainerRef`) when `ScrollablePage` is the scroll container, since the sentinel lives outside the scroll container and the uncontrolled IntersectionObserver may not fire correctly.
- **`cardOverlap` uses inline styles, not Tailwind arbitrary classes**: dynamic values like `` `pb-[${n}px]` `` are purged by Tailwind JIT in production. Always use `style={{ paddingBottom: `${n}px` }}` for dynamic pixel values.
- **`cardRadius` and all static classes use `cn()`**: never string concatenation. Card-specific classes (`cardRadius`, overlap styles) are only applied when `renderedCard` is truthy.
- The component has no sticky behavior — it is a static block outside the scroll container. Collapse is driven entirely by the `collapsed` prop from the parent.

## ScrollablePage

```tsx
<ScrollablePage
  scrollContainerRef={ref}              // exposes the inner div ref to CollapsibleHeader
  onRefresh={refetch}                   // called after pull-down ≥ 60px; TanStack Query refetch
  onLoadMore={fetchNextPage}            // called when bottom sentinel enters viewport
  hasMore={hasNextPage}                 // guards load-more from firing when exhausted
  isRefreshing={isRefetching}           // shows top spinner when true
  isLoadingMore={isFetchingNextPage}    // shows bottom spinner when true
  onCollapsedChange={setCollapsed}      // reports scroll > 0 to parent (drives CollapsibleHeader)
>
  {items.map(...)}
</ScrollablePage>
```

**Refresh triggers:**

- **Mobile (touch)**: Pull-to-refresh — drag down ≥ 60px from `scrollTop === 0`, gesture must be predominantly vertical (`deltaY > deltaX * 2`). During the gesture a `PullIndicator` sub-component shows:
  - `pullDistance < 60`: chevron-down icon + i18n label `scrollablePage.pullToRefresh` ("Pull down to refresh"). Container height = `min(pullDistance, 48)px`.
  - `pullDistance >= 60`: chevron flips 180° (`rotate-180`) + label changes to `scrollablePage.releaseToRefresh` ("Release to refresh"). Release at this point calls `onRefresh`.
  - Release below 60px: gesture cancelled, no refresh, indicator disappears.
  - While `isRefreshing=true` and `pullDistance=0`: spinner shown instead of the text indicator.
- **Desktop (mouse wheel)**: Spin wheel upward (`deltaY < 0`) at `scrollTop === 0` → triggers refresh after a 400 ms settle period (see below). This is the desktop equivalent of pull-to-refresh.

**Spinner lifecycle (wheel):** The component sets `pullDistance = 60` (showing the spinner) before `await onRefresh()`, then clears it to `0` after the promise resolves. The spinner disappears as soon as `onRefresh()` settles.

**onCollapsedChange — hysteresis band:** The component uses a dead zone to prevent spurious flips from iOS elastic bounce:

- `scrollTop === 0` → emit `false` (expanded)
- `scrollTop >= COLLAPSE_THRESHOLD_PX` (20) → emit `true` (collapsed)
- `1 ≤ scrollTop ≤ 19` → emit nothing (dead zone)
- Consecutive identical values are deduplicated — never emits the same value twice in a row.

The scroll container also has `overscroll-behavior-y: contain` applied (via `overscroll-y-contain` Tailwind class) to reduce iOS elastic bounce propagation.

**Pull gesture blocks scroll and onCollapsedChange:** While a pull gesture is active (`pullingRef.current = true`), an imperative `touchmove` listener (attached with `{ passive: false }`) calls `preventDefault()` to prevent the container from scrolling. This ensures `onCollapsedChange` is NOT fired during an active pull gesture, eliminating the simultaneous refresh + collapse condition.

**Wheel settle period:** After `scrollTop` transitions to `0`, wheel-triggered refresh is suppressed for `WHEEL_SETTLE_MS` (400 ms). This prevents an accidental refresh fire on the first upward wheel tick after scrolling back to the top. If the page opens at `scrollTop === 0` with no prior scroll (no `arrivedAtTopRef` timestamp), wheel refresh fires immediately.

**Layout requirement:** `ScrollablePage` uses `flex-1 overflow-y-auto`. For scrolling to work, **all ancestor elements up to the viewport must have a bounded height**. The full chain must be:

```
#app (height: 100%)
  .app-shell (h-full, flex col)
    .page-content (flex-1, min-h-0, flex col)   ← MUST have flex-1
      HomePage root (flex-1, min-h-0, flex col)
        ScrollablePage (flex-1, overflow-y-auto) ← needs bounded height to scroll
```

If any ancestor in this chain lacks an explicit height constraint, `overflow-y-auto` has nothing to overflow against and no scroll events fire.

**Other notes:**
- Load-more fires at most once per `isLoadingMore` cycle — a `loadMoreLockRef` prevents double-fires.
- `onLoadMore` is optional; if omitted, no sentinel is rendered.
- `onRefresh` is optional; if omitted, both touch and wheel refresh are disabled.

## BottomNav

Tab labels use `useTranslation('common')` with keys from `common.nav.*` (`nav.home`, `nav.products`, `nav.cart`, `nav.orders`, `nav.profile`). Never hardcode label strings — add new tabs to both `locales/vi/common.json` and `locales/en/common.json`.

Each tab tap calls `navigate(tab.path)` — a **push** navigation that adds to the history stack. Users can swipe back through their tab history. This is intentional; see `miniapp/CLAUDE.md` → Navigation History for the rationale.

## TabbedView

Context-driven composite component. `TabbedView.TabBar` and `TabbedView.Panels` communicate through a React Context provided by the `TabbedView` root — they can be placed anywhere in the component tree as long as they are descendants.

### Three usage modes

**Mode 1 — Normal (self-contained scroll)**

TabBar and scrollable content stacked together. Each panel owns its own `ScrollablePage`.

```tsx
<TabbedView tabs={tabs} defaultTab="a">
  <TabbedView.TabBar />
  <TabbedView.Panels mode="self">
    <TabbedView.Panel tabKey="a" onRefresh={...} onLoadMore={...} hasMore={...}>
      <List />
    </TabbedView.Panel>
    <TabbedView.Panel tabKey="b">
      <List />
    </TabbedView.Panel>
  </TabbedView.Panels>
</TabbedView>
```

**Mode 2 — Outer scroll (e.g. home page)**

TabBar is sticky inside the outer `ScrollablePage`; panels share the outer scroll container. The page must use **controlled mode** (`activeTab` + `onTabChange`) so it can route `onLoadMore` to the correct tab.

```tsx
// Parent owns activeTab so it can wire onLoadMore correctly
const [activeTab, setActiveTab] = useState<'a' | 'b'>('a');
const hasMore = activeTab === 'a' ? aHasMore : bHasMore;

<ScrollablePage onLoadMore={handleLoadMore} hasMore={hasMore} ...>
  <TabbedView tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as Tab)}>
    <TabbedView.TabBar className="sticky top-0 z-10 bg-surface" />
    <TabbedView.Panels mode="outer" outerScrollRef={scrollRef}>
      <TabbedView.Panel tabKey="a"><List /></TabbedView.Panel>
      <TabbedView.Panel tabKey="b"><List /></TabbedView.Panel>
    </TabbedView.Panels>
  </TabbedView>
</ScrollablePage>
```

**Mode 3 — Header/page split**

TabBar lives inside `CollapsibleHeader`'s `children` slot; panels are the full-page scroll.

```tsx
<CollapsibleHeader topBar={<AppHeader />}>
  <TabbedView.TabBar />       {/* inside header bg zone */}
</CollapsibleHeader>

<TabbedView.Panels mode="self">
  <TabbedView.Panel tabKey="a" onRefresh={...}><List /></TabbedView.Panel>
</TabbedView.Panels>
```

### `TabbedView` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `Tab[]` | `[]` | Tab definitions `{ key: string, label: string }[]` — passed to `TabBar` |
| `defaultTab` | `string` | `tabs[0].key` | Initial active tab (uncontrolled mode) |
| `activeTab` | `string` | — | Controlled active tab; use when the parent needs to know the active tab (e.g. to route `onLoadMore`) |
| `onTabChange` | `(key: string) => void` | — | Called on every tab click; required in controlled mode |

### `TabbedView.Panels` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `'self' \| 'outer'` | — | Required. `self`: each panel wraps its children in a `ScrollablePage`. `outer`: panels are plain divs; scroll is owned by an external container |
| `outerScrollRef` | `MutableRefObject<HTMLDivElement \| null>` | — | Required in `outer` mode — ref to the external `ScrollablePage` scroll container |

### `TabbedView.Panel` props

| Prop | Type | Description |
|---|---|---|
| `tabKey` | `string` | Matches a key in `tabs`; controls which panel is visible |
| `onRefresh` | `() => void \| Promise<void>` | Forwarded to the internal `ScrollablePage` (self mode only) |
| `onLoadMore` | `() => void \| Promise<void>` | Forwarded to the internal `ScrollablePage` (self mode only) |
| `hasMore` | `boolean` | Forwarded to the internal `ScrollablePage` (self mode only) |
| `isRefreshing` | `boolean` | Forwarded to the internal `ScrollablePage` (self mode only) |
| `isLoadingMore` | `boolean` | Forwarded to the internal `ScrollablePage` (self mode only) |

### Key implementation notes

**All panels stay mounted (`display: none` for inactive)**
Inactive panels receive `style={{ display: 'none' }}` — they are never unmounted. This preserves the scroll container's `scrollTop` natively (browser holds it as long as the element stays in the DOM), giving free zero-code scroll memory.

**Outer mode scroll save/restore**
`TabbedViewPanels` maintains a `Map<tabKey, number>` of saved scroll positions. On tab switch:
1. Save `outerScrollRef.current.scrollTop` for the outgoing tab.
2. If the incoming tab has a saved position → restore it.
3. If first visit → scroll to position the panels top just below any sticky preceding sibling.

**Sticky sibling offset (first-visit only)**
On first visit, the target scroll position is computed via `getBoundingClientRect()` and uses `useLayoutEffect` (fires before paint) to avoid a visible flash. If `TabbedView.TabBar` is a direct preceding sibling with `position: sticky`, its height is subtracted so the first panel item appears below the tab bar rather than behind it.

```
Without offset:   TabBar overlaps first item
With offset:      TabBar ──► first item visible ✓
```

The sticky check uses `getComputedStyle(prevEl).position === 'sticky'`, so Mode 3 (TabBar in header, not a sibling) is unaffected and gets a zero offset automatically.

**Coordinate system: `getBoundingClientRect()` not `offsetTop`**
`offsetTop` is relative to `offsetParent` — not the scroll container (which has no `position: relative`). The correct calculation for "scroll panels to top of viewport":

```
targetScrollTop = outerScrollElement.scrollTop
                  + panelsRef.getBoundingClientRect().top
                  - outerScrollElement.getBoundingClientRect().top
                  - stickyOffset
```

## Dropdown Pattern (LanguageSwitcher / ThemeSwitcher)

Both dropdowns share the same structural pattern:

```
<div ref={ref} className="relative">
  <button onClick={toggle} …>  ← trigger
  {open && (
    <div className="absolute right-0 top-full …">  ← panel
      {options.map(…)}  ← option buttons
    </div>
  )}
</div>
```

- `useRef` + `mousedown` listener on `document` to close on outside click
- `useState` for open/closed state
- Active option: `text-primary font-medium`; inactive: `text-content dark:text-content-dark`
- All interactive elements are `<button type="button">` (never `<div>` or `<a>`)
- Panel uses `dark:bg-surface-dark dark:border-border-dark` for dark mode
