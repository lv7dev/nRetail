# Shared Components

App-specific shared components used across multiple pages or layouts. Unlike `ui/`, these components are allowed to reference app state (stores, hooks) directly.

## Components

| Component | Purpose |
|---|---|
| `BottomNav` | Fixed bottom navigation bar for authenticated pages — renders the 5 main routes using icons + i18n labels from `common.nav.*` |
| `CollapsibleHeader` | Sticky header zone with `topBar`, `children`, and `card` slots. The `card` collapses to a compact pill when the user scrolls down (scroll-driven via `onCollapsedChange` from `ScrollablePage`) and re-expands on scroll up. The pill sticks just below the sub-header zone using `position: sticky`. |
| `LanguageSwitcher` | Dropdown to switch i18n language (VI / EN). Reads `i18n.language`, calls `i18n.changeLanguage` |
| `OutletGuard` | Route guard: redirects to `/outlets` if no outlet selected in `useOutletStore`; renders outlet otherwise. Sits between `ProtectedRoute` and `AppLayout` |
| `ProtectedRoute` | Route guard: renders `null` while `!isReady`, redirects to `/login` if no user, renders outlet otherwise |
| `ScrollablePage` | Full-height scroll container (`flex:1 overflow-y:auto`). Provides pull-to-refresh (touch events, 60px threshold) and infinite load-more (IntersectionObserver on bottom sentinel). Calls `onRefresh`, `onLoadMore`, and `onCollapsedChange` callbacks; data fetching stays in the page via TanStack Query. |
| `ThemeSwitcher` | Dropdown to switch theme preference (Light / System / Dark). Reads + writes `useThemeStore`. Pattern mirrors `LanguageSwitcher` |

## CollapsibleHeader

```tsx
<CollapsibleHeader
  topBar={<AppHeader title="..." />}   // always visible, sits at the very top
  card={<OutletContextCard />}         // receives collapsed prop automatically via cloneElement
  scrollContainerRef={ref}             // ref to the ScrollablePage container (for IntersectionObserver root)
  collapsed={collapsed}                // controlled mode — driven by ScrollablePage onCollapsedChange
>
  <SearchBar />                        // rendered inside the primary bg zone, above the card
</CollapsibleHeader>
```

- The `card` element receives `collapsed: boolean` injected via `cloneElement` — the card component must accept and handle this prop.
- `stickyTop` is computed via `ResizeObserver` on the `topBar + children` zone so the pill always sticks at the correct offset regardless of topBar height.
- Works in both controlled (`collapsed` prop) and uncontrolled (internal `IntersectionObserver` on sentinel) modes.
- **Important**: In uncontrolled mode, the internal `collapsed` state starts as `false` (expanded). The IntersectionObserver uses `scrollContainerRef?.current` as root — if no ref is passed, it observes against the viewport.
- **Recommended usage**: Use controlled mode (pass `collapsed` + `scrollContainerRef`) when `ScrollablePage` is the scroll container, since the sentinel lives outside the scroll container and the uncontrolled IntersectionObserver may not fire correctly.

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

- Pull-to-refresh only triggers when `scrollTop === 0` and the drag is predominantly vertical (`deltaY > deltaX * 2`).
- Load-more fires at most once per `isLoadingMore` cycle — a `loadMoreLockRef` prevents double-fires.
- `onLoadMore` is optional; if omitted, no sentinel is rendered.
- `onRefresh` is optional; if omitted, pull gesture is disabled.

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
