## Why

The home page header does not match the approved design: cart and notification icons are missing from the top bar, the decorative wave background is absent, and the scroll-driven collapse of OutletContextCard is broken — the card never collapses because the `ScrollablePage` scroll state is not wired to `CollapsibleHeader`.

## What Changes

- Add cart icon (with badge) and notification bell icon (with badge) to the `AppHeader` `right` slot on the home page
- Add a decorative wave/curve SVG background to the `CollapsibleHeader` on the home page
- Center the AppHeader title on the home page (currently left-aligns when no back button)
- **Fix scroll-driven collapse**: wire `ScrollablePage`'s `onCollapsedChange` and `scrollContainerRef` to `CollapsibleHeader` so the OutletContextCard collapses to a sticky pill when the user scrolls down and re-expands when scrolled back to the top

## Capabilities

### New Capabilities
- `home-header-design`: Visual design spec for the home page header — AppHeader actions (cart, notifications), decorative background, and working collapsible OutletContextCard layout

### Modified Capabilities
- `outlet-context-ui`: The collapsed/pill mode now works correctly on the home page via controlled `collapsed` prop driven by `ScrollablePage`
- `collapsible-header`: HomePage wires controlled mode (`collapsed` prop + `scrollContainerRef`) so the IntersectionObserver-based uncontrolled fallback is bypassed

## Impact

- `miniapp/src/pages/home/index.tsx` — add `collapsed` state + `scrollContainerRef`, wire `onCollapsedChange` from `ScrollablePage` to `CollapsibleHeader`, pass cart/notification nodes to AppHeader `right`
- `miniapp/src/components/ui/AppHeader/AppHeader.tsx` — fix title centering (currently `text-left` when no `onBack`)
- `miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx` — add decorative background support (via `backgroundSlot` prop or CSS)
- No backend changes, no new dependencies
