## Context

`AppLayout` currently renders an `absolute`-positioned header at `top: var(--zalo-chrome-top)` containing the outlet name as a tappable button. This button overlays the top of every page's content. `QuickActionsGrid` independently shows the same outlet name as a static `<span>`. The two are redundant and the AppLayout placement is visually awkward — it floats over the home page's search bar.

## Goals / Non-Goals

**Goals:**
- `AppLayout` becomes a pure layout shell (scroll clearance + BottomNav only) with no business logic or store dependencies
- `QuickActionsGrid` is the single place users change their outlet on the Home page
- Scrollbar hidden app-wide for native-app feel

**Non-Goals:**
- Adding outlet switchers to Order, Outlet Detail, or Account pages — those are handled separately
- Changing how outlet selection itself works (`/outlets`, `useOutletStore`) — routing behaviour is unchanged

## Decisions

### 1. Outlet switcher lives in QuickActionsGrid, not a shared component

`QuickActionsGrid` already reads `useOutletStore`. Adding `useNavigate` there is one line. Extracting a shared `OutletSwitcherRow` component would be premature — only one page uses it right now.

**Alternative considered**: Accept an `onChangeOutlet` prop from `HomePage` (lifting nav up). Rejected — adds prop-drilling for no benefit when `useNavigate` is available inside the component.

### 2. AppLayout drops all store/navigation imports

After removing the header, `AppLayout` has no reason to know about outlets. It becomes:
```
div.app-shell
  div.page-content (paddingBottom for BottomNav clearance)
    <Outlet />
  <BottomNav />
```

Clean separation: layout concerns only, zero business logic.

### 3. Scrollbar hidden on `body` (global)

The page uses document scroll (no `overflow-y` on `page-content`). The scrollbar belongs to `<body>`. One CSS rule in `app.css` hides it globally — appropriate for a full-screen mini app where a browser scrollbar is always wrong.

**Alternative considered**: Scoped to `.page-content` with `overflow-y: auto`. Would require also setting `height` constraints. Deferred until we migrate to the flex-column layout approach.

## Risks / Trade-offs

- **Outlet switcher only on Home page** → Users on other pages have no outlet switcher until those pages are updated. Accepted — deferred by design decision.
- **Removing AppLayout test for outlet nav** → The navigation behaviour is now tested in `QuickActionsGrid.test.tsx`. No coverage gap, just ownership moves.
