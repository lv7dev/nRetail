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
│  bg-primary header (pt-safe)        │
│  ← (back arrow — conditional)       │
│  Title (centered)                   │
│  Search input                       │
├─────────────────────────────────────┤
│  rounded-t-3xl bg-background card   │
│  ┌─────────────────────────────┐    │
│  │  TabbedView (mode="self")   │    │
│  │  Connected | Not-connected  │    │
│  │  (pill TabBar in px-4 wrap) │    │
│  │  Panels — vertically scroll │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### TabbedView usage

Uses `TabbedView` with **`mode="self"`** (self-contained scroll). The `TabBar` lives inside a `px-4` wrapper beneath the header. Each `Panel` handles its own overflow; the header remains fixed above.

```tsx
<TabbedView tabs={...} activeTab={activeTab} onTabChange={...}>
  <div className="px-4">
    <TabbedView.TabBar className="rounded-2xl bg-surface-muted p-1 dark:bg-surface-dark-muted" />
  </div>
  <TabbedView.Panels mode="self">
    <TabbedView.Panel tabKey="connected" onLoadMore={...} hasMore={...} isLoadingMore={...}>
      ...
    </TabbedView.Panel>
    <TabbedView.Panel tabKey="not-connected" ...>
      ...
    </TabbedView.Panel>
  </TabbedView.Panels>
</TabbedView>
```

### Data fetching

Both tabs use `useInfiniteQuery` with cursor-based pagination. The query is only `enabled` when its tab is active to avoid unnecessary requests.

```ts
queryKey: ['outlets', { connected: true, q: debouncedSearchTerm }]
// Changing q resets pagination automatically (new key = new query)
```

Search is debounced (300 ms) using `useEffect` + `window.setTimeout`. The debounced term goes into both query keys.

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
const canGoBack = location.key !== 'default';
// 'default' = first navigation after app boot (no history stack)
// Any other key = user navigated here from another route
```

When `canGoBack` is true, a `<button aria-label={t('common:button.back')}>` appears top-left in the header and calls `navigate(-1)`. This handles the home → `/outlets` re-selection flow.

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
- `common:button.back` — back arrow aria-label

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

// Render with history stack (back arrow visible)
function renderPageWithHistory() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/', '/outlets']} initialIndex={1}>
        <OutletListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Render without history (back arrow hidden)
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

Back arrow assertions use `aria-label` via `'common:button.back'` (colon namespace separator, not dot — matches what `t('common:button.back')` returns when mocked).

### Integration test patterns

Uses MSW to intercept `GET /outlets`. Handler must return `{ data: Outlet[], meta: { nextCursor } }` matching the backend ResponseInterceptor envelope (the service unwraps one level, so MSW returns `{ data: { data: [...], meta: ... } }`).
