# Hooks

Custom React hooks live in `src/hooks/`. They are the only place where TanStack Query mutations and queries are created. Pages and components call hooks — never a service module or `apiClient` directly.

## useDebounce.ts — Generic debounce

```ts
import { useDebounce } from '@/hooks/useDebounce';

const debouncedValue = useDebounce(rawValue, 300); // delay in ms
```

Returns a value that only updates after the input has been stable for `delay` ms. The caller owns the raw state — the hook only returns the delayed copy. Works with any type `T` (string, number, object).

**Use whenever** a user-input value drives a query key or an expensive side effect and should not fire on every keystroke.

---

## useOutlets.ts — Outlets domain hook

All TanStack Query logic for the outlets domain lives here. Pages must not call `outletService` directly.

### API

```ts
const {
  connectedQuery,       // UseInfiniteQueryResult for connected outlets
  notConnectedQuery,    // UseInfiniteQueryResult for not-connected outlets
  connectedOutlets,     // Outlet[] — flattened from all loaded pages
  notConnectedOutlets,  // Outlet[] — flattened from all loaded pages
  hasSearch,            // boolean — true when searchTerm.length > 0
  handleMembershipAction, // (outletId: string, action: UpdateMembershipAction) => void
} = useOutlets({ activeTab, searchTerm });
```

| Param | Type | Notes |
|---|---|---|
| `activeTab` | `OutletTabKey` | Controls which query is `enabled`; import from `@/types/outlet` |
| `searchTerm` | `string` | Pass already-debounced value; empty string → `q: undefined` in query key |

### Query key convention

```ts
['outlets', { connected: boolean, q: string | undefined }]
```

Empty search maps to `q: undefined` (not `q: ''`) to avoid cache fragmentation.

### Mutation side effects

| Action | Cache invalidation |
|---|---|
| `confirm` | Both `connected: true` and `connected: false` query groups |
| `reject` | Only `connected: false` query group |

### Usage in OutletListPage

```ts
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);
const { connectedQuery, connectedOutlets, ... } = useOutlets({
  activeTab,
  searchTerm: debouncedSearchTerm,
});
```

---

## useAuth.ts — Auth Hook Catalogue

All auth mutations and queries are in `src/hooks/useAuth.ts`.

### Mutations

| Hook                  | Calls                                                         | Side effects                                                        |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `useLogin()`          | `POST /auth/login`                                            | On success: `storage.setTokens()` + `setAuth(user)`                 |
| `useRequestOtp(flow)` | `POST /auth/otp/register` or `POST /auth/otp/forgot-password` | None                                                                |
| `useVerifyOtp()`      | `POST /auth/otp/verify`                                       | None — caller navigates with returned `otpToken`                    |
| `useRegister()`       | `POST /auth/register`                                         | On success: `storage.setTokens()` + `setAuth(user)`                 |
| `useResetPassword()`  | `POST /auth/reset-password`                                   | None — caller navigates to `/login`                                 |
| `useLogout()`         | `POST /auth/logout`                                           | On settled (success or error): `clearAuth()` (clears tokens + user) |

### Queries

| Hook      | Calls          | Notes                                                                           |
| --------- | -------------- | ------------------------------------------------------------------------------- |
| `useMe()` | `GET /auth/me` | `enabled: false` — only used by `AuthProvider` for rehydration via `.refetch()` |

### Usage Pattern

```tsx
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: FormData) => {
    login(data, {
      onSuccess: () => navigate('/'),
      onError: (err) => setError(resolveApiError(err, t)),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... fields ... */}
      <Button loading={isPending} type="submit">
        {t('login.submit')}
      </Button>
    </form>
  );
}
```

## Adding a New Hook

For new domains (products, orders, etc.), create `src/hooks/useProducts.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productService.getList,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

**Rules:**

- One hook file per domain
- `queryKey` arrays must be consistent across the domain — define them as constants if used in multiple hooks
- Side effects (cache invalidation, navigation, token storage) belong in `onSuccess` / `onSettled` — never in the service layer
- Never call any service module (`authService.*`, `outletService.*`) or `apiClient.*` directly in a component — always go through a hook

## Testing Pages That Use Hooks

Pages that call hooks require `QueryClientProvider` in tests. Mock the **service layer** (not the hook module) so real TanStack Query lifecycle runs:

```tsx
// ✅ preferred — mock the service, keep real hook lifecycle
vi.mock('@/services/authService', () => ({
  authService: { login: vi.fn().mockResolvedValue({ accessToken: '...', ... }) },
}))

// Use only when testing the hook's own behaviour in isolation
vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
}))
```

See `src/pages/CLAUDE.md` for the full `QueryClientProvider` wrapper pattern.

## Testing Hooks Directly (vi.hoisted)

When testing hook files themselves (`useAuth.test.ts`), mock functions referenced inside `vi.mock` factories must be created with `vi.hoisted()`. Variables declared with `const` outside the factory are in the Temporal Dead Zone when the factory runs (Vitest hoists `vi.mock` calls before imports).

```ts
// ✅ correct — vi.hoisted() creates functions before hoisting
const { mockAuthService, mockStorage } = vi.hoisted(() => ({
  mockAuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    // ...
  },
  mockStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn().mockReturnValue('refresh-tok'),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({ authService: mockAuthService }));
vi.mock('@/utils/storage', () => ({ storage: mockStorage }));

// ❌ wrong — const mockFn = vi.fn() is in TDZ when factory runs
const mockFn = vi.fn();
vi.mock('@/services/authService', () => ({ authService: { login: mockFn } })); // ReferenceError
```
