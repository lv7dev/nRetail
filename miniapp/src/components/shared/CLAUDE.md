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

- **Mobile (touch)**: Pull-to-refresh — drag down ≥ 60px from `scrollTop === 0`, gesture must be predominantly vertical (`deltaY > deltaX * 2`).
- **Desktop (mouse wheel)**: Spin wheel upward (`deltaY < 0`) at `scrollTop === 0` → triggers refresh immediately. This is the desktop equivalent of pull-to-refresh.

**Spinner lifecycle (wheel):** The component sets `pullDistance = 60` (showing the spinner) before `await onRefresh()`, then clears it to `0` after the promise resolves. The spinner disappears as soon as `onRefresh()` settles.

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
