## Why

The outlet list page uses a plain `Input` component for its search field, which looks visually different from the search bar on the home page (different border-radius, missing icon). Meanwhile, the back arrow on the outlet list page incorrectly appears on first app open — when `OutletGuard` redirects there via `<Navigate replace />`, `location.key` is no longer `'default'`, so the check produces a false positive and the back button does nothing meaningful.

## What Changes

- **New**: `SearchInput` UI component (`components/ui/SearchInput/`) — a rounded-xl search field with a leading magnifying-glass icon and a real `<input>` element, matching the home page's search bar shape
- **Update**: Outlet list page replaces `Input` with `SearchInput` for visual consistency
- **Update**: Home page `SearchBar` wraps `SearchInput` instead of rendering its own div (placeholder stays non-interactive)
- **Update**: Back arrow on outlet list page uses explicit router state (`location.state?.canGoBack`) instead of `location.key !== 'default'`
- **Update**: `OutletContextCard` passes `{ state: { canGoBack: true } }` when navigating to `/outlets`

## Capabilities

### New Capabilities
- `search-input`: Generic `SearchInput` UI component — rounded-xl field with icon and real input, replaces per-page custom search markup

### Modified Capabilities
- `outlet-list-ui`: Back arrow detection changes from `location.key !== 'default'` to `location.state?.canGoBack`; search field uses `SearchInput` instead of `Input`
- `outlet-context-ui`: Navigation to `/outlets` passes `{ state: { canGoBack: true } }` to enable the back arrow

## Impact

- `components/ui/SearchInput/` — new folder (component + tests + barrel)
- `components/ui/index.ts` — add `SearchInput` export
- `pages/home/SearchBar.tsx` — wraps `SearchInput` (no behavior change)
- `pages/outlets/index.tsx` — `Input` → `SearchInput`, `canGoBack` logic updated
- `pages/home/OutletContextCard.tsx` — `navigate('/outlets')` → `navigate('/outlets', { state: { canGoBack: true } })`
- `pages/outlets/OutletListPage.test.tsx` — update back-arrow test helper to pass router state instead of multi-entry history
- `openspec/specs/outlet-list-ui/spec.md` — delta for back arrow and search field
- `openspec/specs/outlet-context-ui/spec.md` — delta for canGoBack state
