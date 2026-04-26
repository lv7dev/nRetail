## Why

The Outlet List page layout does not match the design: the `TabBar` (Connected / Not connected) sits inside the white content card instead of the red header zone, and the search bar is in the red header instead of the white content zone. The page needs to match the approved UI where the tab switcher lives in the header and search lives in the scrollable content area.

## What Changes

- Move `TabbedView.TabBar` from the white card into `CollapsibleHeader`'s `children` slot (red zone)
- Move the search `Input` from the red header into the white content zone, above the outlet list panels
- Restructure `outlets/index.tsx` to use TabbedView Mode 3 (TabBar in header, `Panels mode="self"` below)
- Add `variant="on-primary"` (or equivalent `className` override) to `TabBar` so active/inactive tab colours work against a red background
- Remove the manual header div + white card div; replace with `CollapsibleHeader` + `TabbedView` root wrapping the whole page

## Capabilities

### New Capabilities

_(none — all components already exist)_

### Modified Capabilities

- `outlet-list-ui`: Layout requirements change — TabBar moves to header zone, search moves to content zone; page now uses `CollapsibleHeader` + TabbedView Mode 3
- `tab-bar`: Add support for rendering on a primary-colour background (active tab = white bg + primary text; inactive = transparent + white text) via a new `variant` prop or exposed className token

## Impact

- `miniapp/src/pages/outlets/index.tsx` — full layout restructure (logic untouched)
- `miniapp/src/components/ui/TabBar/TabBar.tsx` — add `variant` prop (or verify className override is sufficient)
- `miniapp/src/components/ui/TabBar/TabBar.test.tsx` — cover new variant
- `miniapp/src/pages/outlets/OutletListPage.test.tsx` — update snapshot/structure assertions
- No backend changes, no API changes, no routing changes
