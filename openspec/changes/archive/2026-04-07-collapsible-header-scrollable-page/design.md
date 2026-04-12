## Context

The miniapp's home page currently renders a flat scrollable `<div>` with no scroll-driven behavior. `QuickActionsGrid` is the first card in the scroll content, overlapping the blue header area via `-mt-4`. There is no pull-to-refresh or load-more mechanism anywhere in the frontend.

The `AppLayout` owns the scroll container (`page-content` div). Individual pages render inside it as children of `<Outlet />`.

Two new shared components are needed:
1. `CollapsibleHeader` — a sticky header zone where a `card` prop collapses to a pill on scroll
2. `ScrollablePage` — a full-height scroll container with pull-to-refresh and load-more built in

## Goals / Non-Goals

**Goals:**
- `CollapsibleHeader` is reusable across any page that needs a collapsible context card
- `ScrollablePage` is reusable for any list page requiring refresh and/or infinite scroll
- No new npm dependencies — use browser-native APIs (IntersectionObserver, touch events)
- Home page adopts both components as the reference implementation

**Non-Goals:**
- Not building a Zalo-native pull-to-refresh (no `zmp-ui` pull component exists; custom touch implementation is acceptable)
- Not implementing actual API pagination for Home page sections (mock data stays; `ScrollablePage` just provides the mechanism)
- Not animating the `topBar` (AppHeader) — only the `card` collapses

## Decisions

### D1: Layout structure — CollapsibleHeader sits above the scroll zone

The header and its sticky card live *outside* `ScrollablePage`. The page column is:
```
page-content (full height, flex column)
  ├── CollapsibleHeader   (height: auto — shrinks when card collapses)
  └── ScrollablePage      (flex: 1, overflow-y: auto — fills remaining height)
```

**Rationale:** The `topBar` (title + icons) must always be visible. Putting the header inside the scroll zone would allow the title to scroll away. The "above scroll" layout keeps navigation chrome stable and only collapses the context card.

**Alternative considered:** Place everything inside `ScrollablePage`, use a sticky header inside the scroll zone. Rejected — more complex, the title bar disappears on scroll, worse for usability.

### D2: Collapse detection — IntersectionObserver on a sentinel div

A zero-height `<div>` (sentinel) sits at the bottom edge of the card's full-height content. An `IntersectionObserver` watches it:
- Sentinel exits the root (card scrolled past) → collapse to pill
- Sentinel re-enters → expand to full

**Rationale:** No scroll listener needed. The observer fires only on state change, not every scroll pixel. No throttling/debouncing required. Works regardless of which element is the scroll container.

**Alternative considered:** `onScroll` listener tracking `scrollTop`. Rejected — requires throttling, fires on every frame, tight coupling to scroll container identity.

### D3: Pill collapse visual — max-height + opacity CSS transition

The card renders both expanded and pill content at all times; CSS `max-height` transition controls visibility. The pill is a single row: outlet icon + name + chevron.

```css
.card-expanded { max-height: 200px; opacity: 1; }  /* full card */
.card-pill     { max-height: 48px; opacity: 1; }   /* pill only */
```

**Rationale:** `max-height` transition is GPU-friendly on mobile WebView. `height: auto` cannot be transitioned directly. The pill content is always mounted (no conditional render), avoiding layout jank on re-expand.

### D4: Pull-to-refresh — touch events on ScrollablePage's scroll container

Track `touchstart` → `touchmove` → `touchend` on the scroll container div. Trigger when:
- `scrollTop === 0` (at the top)
- `deltaY > 0` (pulling down)
- `deltaY > THRESHOLD` (60px) on touch end

Show a spinner indicator that translates down during the drag. Reset after `onRefresh` resolves.

**Rationale:** No library needed. Touch event approach is standard on mobile WebViews. The 60px threshold matches common platform conventions.

### D5: Load-more — IntersectionObserver on a bottom sentinel inside ScrollablePage

A sentinel div renders at the end of the children. When it enters the viewport and `hasMore && !isLoadingMore`, call `onLoadMore`. Debounce with a `loadingRef` flag to prevent double-fires.

### D6: ScrollablePage owns its scroll container

`ScrollablePage` is `overflow-y: auto; flex: 1` — it fills the remaining height below `CollapsibleHeader` inside `page-content`. This gives it full ownership of touch events and `scrollTop`.

**Implication:** `AppLayout`'s `page-content` div becomes a flex column container. This is a minor layout change with no user-visible impact.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `IntersectionObserver` fires with `rootMargin` issues in Zalo WebView | Use `root: scrollContainerRef.current` (explicit root) instead of `root: null` (viewport) |
| Touch events conflict with horizontal scroll sections (BannerCarousel, PromotionSection) | Only trigger pull-to-refresh when `touchmove` is predominantly vertical (`deltaY > deltaX * 2`) |
| `max-height` transition feels slow if card content grows | Cap `max-height` value; measure card at mount to set tight bound |
| Sentinel div for load-more triggers during initial render before any scroll | Guard with `hasMore && !isLoadingMore && items.length > 0` |

## Open Questions

- Should `CollapsibleHeader` expose a `collapsed` prop for controlled mode (useful for pages that need to programmatically expand the card)? — Defer to v2 unless a concrete use case emerges.
- Pull-to-refresh spinner: use a simple CSS spinner (no dependency) or the existing `Button` loading SVG? — Reuse the `Button` spinner SVG for visual consistency.
