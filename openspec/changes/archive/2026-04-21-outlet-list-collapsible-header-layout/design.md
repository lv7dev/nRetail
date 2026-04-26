## Context

`OutletListPage` currently builds its own header div (red zone with back arrow + title + search) and a white card div below that holds `TabbedView.TabBar` + panels. This is bespoke layout code that duplicates what `CollapsibleHeader` already provides and puts the controls in the wrong zones relative to the approved design.

The approved design (see `outlet_list_tab_connected.png` / `outlet_list_tab_not_connected.png`) places the **TabBar inside the red header** and the **search bar in the white content zone**. TabbedView already documents this as Mode 3 (TabBar in header, panels below).

`TabBar`'s active/inactive colours are hardcoded for a light surface (`bg-primary` active, `border-border` inactive). On a red (`bg-primary`) background those colours are invisible — a new `variant` is required.

## Goals / Non-Goals

**Goals:**
- Restructure `OutletListPage` to use `CollapsibleHeader` + TabbedView Mode 3, matching the design
- Add `variant="on-primary"` to `TabBar` for white-on-red tab styling
- Surface `variant` through `TabbedViewTabBar` so `TabbedView.TabBar` callers can pass it
- Keep all existing behaviour (auto-forward, empty state, infinite scroll, search, back arrow) identical

**Non-Goals:**
- Collapsible behaviour on the outlet page (no `ScrollablePage.onCollapsedChange` — the header is static)
- Connecting the "Connect" button to a real API (already deferred)
- Any changes to `OutletItem`, `outletService`, routing, or stores

## Decisions

### Decision 1: `variant` prop on `TabBar` (not per-button className props)

**Options considered:**
- `variant="default" | "on-primary"` — one prop controls the full colour set
- `activeClassName` + `inactiveClassName` — full per-button override
- CSS custom properties — caller sets `--tab-active-bg` etc.

**Chosen: `variant` prop.** Only two visual contexts exist in the app; a typed `variant` keeps the API minimal, avoids callers having to know internal class names, and the variant values are self-documenting. Per-button className would expose the component's internal structure to callers unnecessarily.

**`on-primary` colours (from design):**
- Active tab: `bg-white text-primary`
- Inactive tab: `bg-transparent text-white/80` (no border)

### Decision 2: Search bar is between CollapsibleHeader and TabbedView.Panels (not inside panels)

Search state is shared across both tabs. Putting search inside each `TabbedView.Panel` would require either duplicated inputs or prop-drilling. Placing it as a fixed element in the white zone (outside panels) keeps state ownership at the page level and matches the design where search is always visible above the list.

### Decision 3: No card prop on CollapsibleHeader — white zone starts immediately below

The outlet page header has no collapsible card (no outlet context card, no overlap). `CollapsibleHeader` with no `card` prop renders a clean bottom edge. The white content zone (`rounded-t-3xl bg-background`) directly follows and provides the curved top join visually.

### Decision 4: TabbedView wraps the full page (header + panels)

TabbedView Context must be an ancestor of both `CollapsibleHeader` (which renders `TabbedView.TabBar` inside its children slot) and `TabbedView.Panels`. The page root becomes `<TabbedView>` and everything nests inside.

## Risks / Trade-offs

- **TabBar variant is additive** — existing `default` behaviour is unchanged; only new `variant="on-primary"` callers use the new colours. No regressions expected.
- **CollapsibleHeader without a card** — the `decoration` slot (wave SVG) is not used here; the header is plain red. This is intentional; the outlet page has no wave decoration in the design.
- **Search not inside ScrollablePage** — search stays fixed while the list scrolls. This is correct per the design but differs from having a sticky search inside the scroll. If a future design change wants search to scroll away, it would need to move inside the panels.

## Migration Plan

1. Add `variant` to `TabBar` and `TabbedViewTabBar` (with tests)
2. Restructure `OutletListPage` layout (page logic stays identical)
3. Update `OutletListPage` tests for new DOM structure
4. Run full test suite; update `outlets/CLAUDE.md` layout diagram
