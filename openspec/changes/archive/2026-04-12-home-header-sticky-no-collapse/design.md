## Context

The home page header had three problems:
1. **Visual**: Missing cart and notification icons in the AppHeader, missing decorative wave background, and left-aligned title
2. **Behavioral**: The scroll-driven collapse of OutletContextCard was broken — `ScrollablePage`'s scroll state was not wired to `CollapsibleHeader`, so the card never collapsed
3. **Animation**: The `OutletContextCard` used conditional rendering (`{!collapsed && ...}`) for the quick-actions grid, making CSS transitions impossible — elements were instantly mounted/unmounted

The fix wires `HomePage` as the state bridge: `ScrollablePage.onCollapsedChange` → `useState` → `CollapsibleHeader.collapsed` (controlled mode). The `OutletContextCard` animates its quick-actions grid using CSS `grid-template-rows` transition (`1fr` ↔ `0fr`) instead of conditional rendering.

## Goals / Non-Goals

**Goals:**
- Match the approved `header.png` design: centered title, cart icon + badge, notification icon + badge, wave background
- Fix scroll-driven collapse so OutletContextCard collapses to a sticky pill on scroll and re-expands at top
- Animate the collapse/expand transition smoothly (200ms ease-in-out)
- Fix `AppHeader` title alignment (always centered, not left-aligned when there's no back button)

**Non-Goals:**
- Changing `CollapsibleHeader` collapse behavior for other pages
- Building a real notification system (badge count is static/placeholder for now)
- Pull-to-refresh or load-more changes

## Decisions

### D1: Wire collapse via controlled mode with shared scrollContainerRef
`HomePage` holds `collapsed` state and a `scrollRef`. `ScrollablePage` reports `onCollapsedChange(scrollTop > 0)` which sets the state. `CollapsibleHeader` receives the `collapsed` prop (controlled mode) and `scrollContainerRef` for its IntersectionObserver root. This bypasses the broken uncontrolled mode where the sentinel never left the viewport.

**Alternative considered**: Fix the uncontrolled IntersectionObserver path — rejected because controlled mode is more predictable and the page already needs to orchestrate both components.

**Previous approach (rejected)**: Removing collapse entirely — rejected after user feedback; the collapse behavior is desired.

### D2: Center AppHeader title unconditionally
Remove `!onBack && 'text-left'` from `AppHeader`. The title is always centered regardless of whether a back button is present. The back button on the left and action icons on the right already provide visual balance.

**Alternative considered**: Add a `textAlign` prop — rejected; all designs show centered titles.

### D3: Cart and notification icons as right-slot nodes in AppHeader
On the home page, pass a JSX node to `AppHeader`'s `right` prop containing both icons with badge overlays. Cart badge reads from `useCartStore`. Notification count is a static placeholder (0) until a notification system exists.

**Alternative considered**: Bake cart/notification into `AppHeader` — rejected; `AppHeader` is a generic component and should not own app-specific state.

### D4: Wave background via decorative SVG asset in CollapsibleHeader outer div
Pass a `decoration` ReactNode prop to `CollapsibleHeader`'s bg div. The home page provides the `<img src={waveHeaderSvg} />` element. The CollapsibleHeader renders it absolutely positioned inside its bg zone.

**Alternative considered**: Background-image CSS — rejected; harder to fine-tune placement in Tailwind. Inline SVG in `AppHeader` — rejected; couples the generic AppHeader to a specific visual.

### D5: Animate collapse via CSS grid-template-rows transition
`OutletContextCard` always renders the quick-actions grid in the DOM (no conditional mount/unmount). The grid is wrapped in a CSS Grid container that transitions `grid-template-rows` between `1fr` (expanded) and `0fr` (collapsed) over 200ms ease-in-out. An `overflow-hidden` inner wrapper prevents content from leaking during the animation.

**Alternative considered**: `max-height` transition — rejected because it requires a known max value and produces inconsistent timing. `height: auto` cannot be transitioned natively. The `grid-template-rows: 0fr → 1fr` technique is the cleanest zero-to-auto height animation in modern CSS.

## Risks / Trade-offs

- [Badge placeholder] Notification count hardcoded at 0. When a real notification system arrives, the badge will need to be wired up. No structural risk — the UI accepts any count.
- [DOM always present] Quick-actions grid stays in the DOM when collapsed (needed for CSS animation). This is a minor trade-off vs conditional render — the DOM nodes are lightweight (4 buttons) and have no side effects.
