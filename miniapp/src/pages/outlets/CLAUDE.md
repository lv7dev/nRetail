# Outlets Page

Outlet picker — shown after login before any app features are accessible. Protected by `ProtectedRoute` but sits **outside** `OutletGuard`.

## Files

| File | Purpose |
|---|---|
| `index.tsx` | `OutletListPage` — page component (default export) |
| `OutletItem.tsx` | Named export `OutletItem` — single outlet row |
| `OutletListPage.test.tsx` | Unit tests for `OutletListPage` |
| `OutletItem.test.tsx` | Unit tests for `OutletItem` |
| `OutletListPage.integration.test.tsx` | MSW integration tests (real HTTP layer) |

## OutletListPage

### Layout

```
┌─────────────────────────────────────┐
│  CollapsibleHeader / bg-primary     │
│  ← (back arrow — conditional)       │
│  Title (centered)                   │
│  Connected | Not connected TabBar   │
├─────────────────────────────────────┤
│  rounded-t-3xl bg-background zone   │
│  Search input                       │
│  TabbedView.Panels (mode="self")    │
│  Active panel scrolls vertically    │
└─────────────────────────────────────┘
```

### TabbedView usage

Uses `TabbedView` Mode 3: the `TabbedView` root wraps the whole page, `TabbedView.TabBar` renders inside `CollapsibleHeader`, and `TabbedView.Panels` stays in **`mode="self"`** inside the white content zone. Each `Panel` handles its own overflow while the header stays fixed above.

```tsx
<TabbedView tabs={...} activeTab={activeTab} onTabChange={...}>
  <CollapsibleHeader topBar={<AppHeader title={t('outlets.selectOutlet')} onBack={canGoBack ? () => navigate(-1) : undefined} />}>
    <TabbedView.TabBar variant="on-primary" />
  </CollapsibleHeader>

  <div className="rounded-t-3xl bg-background">
    <SearchInput value={searchTerm} onChange={...} onClear={() => setSearchTerm('')} placeholder={...} />
    <TabbedView.Panels mode="self">
      <TabbedView.Panel
        tabKey="connected"
        onRefresh={() => connectedQuery.refetch()}
        isRefreshing={connectedQuery.isFetching && !connectedQuery.isFetchingNextPage}
        onLoadMore={...}
        hasMore={...}
        isLoadingMore={...}
      >
        ...
      </TabbedView.Panel>
      <TabbedView.Panel
        tabKey="not-connected"
        onRefresh={() => notConnectedQuery.refetch()}
        isRefreshing={notConnectedQuery.isFetching && !notConnectedQuery.isFetchingNextPage}
        ...
      >
        ...
      </TabbedView.Panel>
    </TabbedView.Panels>
  </div>
</TabbedView>
```

### Data fetching

All server state comes from `useOutlets` (`src/hooks/useOutlets.ts`). The page owns only UI state: `activeTab`, `searchTerm`, and the debounced copy via `useDebounce`.

```ts
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);
const { connectedQuery, connectedOutlets, notConnectedQuery, notConnectedOutlets,
        hasSearch, handleMembershipAction } = useOutlets({ activeTab, searchTerm: debouncedSearchTerm });
```

**Pull-to-refresh:** Each panel passes `onRefresh` and `isRefreshing` directly to its `TabbedView.Panel`. Since inactive panels are hidden (`display: none`) they cannot receive touch or wheel events — "refresh active tab only" is enforced by layout, not conditional logic. `isRefreshing` uses `isFetching && !isFetchingNextPage` so the refresh spinner does not appear during load-more scrolling.

`useOutlets` runs two `useInfiniteQuery` calls with cursor-based pagination. Each query is only `enabled` when its tab is active. Query key convention:

```ts
['outlets', { connected: boolean, q: string | undefined }]
// Changing q resets pagination automatically (new key = new query)
// Empty string → q: undefined to avoid cache fragmentation
```

See `src/hooks/CLAUDE.md` for the full `useOutlets` API and mutation side effects.

### Connected tab logic

| State | Display |
|---|---|
| Loading | Loading message |
| 0 results, no search | Empty state + logout button |
| 0 results, search active | No-results message |
| 1 result, no search | Auto-forward to `/` (no UI shown) |
| N results | Scrollable list |

**Auto-forward guard:** Uses `hasAutoForwardedRef` to prevent repeated navigations if the component re-renders. Resets to `false` whenever the condition no longer holds.

### Not-connected tab logic

| State | Display |
|---|---|
| Loading | Loading message |
| 0 results | No-results message |
| N results | Scrollable list (OutletItem with Connect button) |

No empty state on the not-connected tab — zero results always shows "no results" (empty assignments on the connected tab is the meaningful signal).

### Back arrow

```tsx
const canGoBack = !!location.state?.canGoBack;
// Push navigations to /outlets that should show the back arrow must pass:
navigate('/outlets', { state: { canGoBack: true } });
```

When `canGoBack` is true, `AppHeader` renders a back button (`aria-label="back"`) and calls `navigate(-1)` via the `onBack` prop. The first-boot `OutletGuard` redirect does not carry this state, so the picker does not show a dead back arrow.

### Outlet selection

Tapping a connected outlet calls:
```ts
setSelectedOutlet(outlet);
navigate('/', { replace: true });
```

`replace: true` removes `/outlets` from the history stack — the user should not be able to swipe back to the picker after selecting.

### i18n

Uses `useTranslation(['outlets', 'common'])` (array form for multiple namespaces). Keys:
- `outlets.*` — all page-specific strings

The back button aria-label is `"back"` (hardcoded inside `AppHeader`) — no i18n key needed.

## OutletItem

Stateless display component. Receives `outlet: Outlet` and `connected: boolean`.

```tsx
<OutletItem outlet={outlet} connected={true | false} />
```

### Avatar

Shows `outlet.imageUrl` if present; falls back to `getInitials(outlet.name)` (first letter of first two words, uppercased) on a colored background.

### Connected variant

Shows name, optional code, optional address with location icon. No action buttons.

The parent (`OutletListPage`) wraps each connected item in a `<button>` and handles the tap → select + navigate.

### Not-connected variant

Same layout plus right-side badge:
- `outlets.notMyOutlet` warning label
- `Connect` button with `event.stopPropagation()` to prevent the outer button from firing

The Connect button currently stops propagation only — actual connection flow is a future feature.

## Testing

### Unit test patterns

```tsx
// Mock i18n (returns key as value — language-neutral assertions)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock outletService
vi.mock('@/services/outletService', () => ({
  outletService: {
    getOutlets: vi.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Test', address: null, role: 'OWNER' }],
      meta: { nextCursor: null },
    }),
  },
}));

// Render with canGoBack state (back arrow visible)
function renderPageWithHistory() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[{ pathname: '/outlets', state: { canGoBack: true } }]}>
        <OutletListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Render without canGoBack state (back arrow hidden — covers first-boot redirect)
function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <OutletListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
```

Back arrow assertions use `aria-label="back"` — `AppHeader` hardcodes this label, so `getByRole('button', { name: 'back' })` finds it regardless of i18n mock.

### Integration test patterns

Uses MSW to intercept `GET /outlets`. Handler must return `{ data: Outlet[], meta: { nextCursor } }` matching the backend ResponseInterceptor envelope (the service unwraps one level, so MSW returns `{ data: { data: [...], meta: ... } }`).
