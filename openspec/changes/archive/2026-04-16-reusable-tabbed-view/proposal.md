## Why

`TabbedProductSection` on the home page is a one-off component locked inside `pages/home/`. As the app grows, other pages (products catalogue, order history, etc.) need the same tab-switching-with-list pattern. The current component has hardwired i18n keys, no scroll memory, and cannot separate its TabBar from its content — making it impossible to reuse or place the tab bar inside a header.

## What Changes

- **New** generic `TabBar` UI component: horizontally scrollable, each tab `flex-1` / `whitespace-nowrap`, no business logic
- **New** `TabbedView` shared component: Context-based composite that connects `TabbedView.TabBar` and `TabbedView.Panels` anywhere in the component tree
- **New** `TabbedView.Panel`: single tab panel that stays mounted (`display: none` when inactive) to preserve scroll position natively — no manual scroll tracking needed for self-scroll mode
- **New** outer-scroll mode: `TabbedView.Panels` delegates scroll to an external `ScrollablePage`, saves and restores per-tab `scrollTop` of the outer container, first-visit defaults to the component's own `offsetTop`
- **Replace** `pages/home/TabbedProductSection` with `TabbedView` + domain-specific wiring
- **No breaking changes** to `ScrollablePage` or `CollapsibleHeader`

## Capabilities

### New Capabilities

- `tab-bar`: Generic tab switcher — horizontal overflow scroll, flex-1 tabs, single-line no-wrap labels, active/inactive visual states, controlled via props
- `tabbed-view`: Composite component connecting `TabBar` + `Panels` via Context; supports self-scroll mode (each panel owns a `ScrollablePage`, scroll preserved by keeping panels mounted) and outer-scroll mode (saves/restores per-tab `scrollTop` of an external scroll container); `TabBar` and `Panels` are independently placeable sub-components

### Modified Capabilities

<!-- None — ScrollablePage and CollapsibleHeader requirements are unchanged -->

## Impact

- **New files**: `components/ui/TabBar/`, `components/shared/TabbedView/`
- **Modified**: `pages/home/index.tsx`, `pages/home/TabbedProductSection.tsx` (replaced by `TabbedView` wiring)
- **Deleted**: `pages/home/TabbedProductSection.tsx` and its test (superseded)
- **No API changes**, no new dependencies
- **i18n**: Tab labels move out of `TabbedView` — callers supply translated labels via the `tabs` prop
