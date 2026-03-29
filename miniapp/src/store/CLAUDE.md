# Store

Zustand stores for client-side state. One file per domain. Never use stores for server data — use TanStack Query for that.

## Files

| File              | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `useAuthStore.ts` | Auth session: current user, readiness flag, setAuth, clearAuth           |
| `useCartStore.ts` | Shopping cart: items list, add/remove/clear actions, item count selector |

## useAuthStore

```ts
interface AuthState {
  user: User | null; // null = not logged in
  isReady: boolean; // true once rehydration attempt is complete (success or failure)
  setAuth: (user: User) => void; // sets user + isReady = true
  clearAuth: () => void; // clears tokens in storage + sets user = null
}
```

**Key behaviour:**

- `isReady` starts `false` and is set to `true` by `AuthProvider` after it has attempted to rehydrate the session from storage. `ProtectedRoute` renders `null` until `isReady = true` to avoid a login redirect flash.
- `clearAuth()` calls `storage.clearTokens()` as a side effect — it is the single place that clears tokens. Do not call `storage.clearTokens()` directly outside this store.
- `setAuth(user)` is called by `useLogin` and `useRegister` hooks on success.

```ts
import { useAuthStore } from '@/store/useAuthStore';

// Reading state in a component
const user = useAuthStore((s) => s.user);
const isReady = useAuthStore((s) => s.isReady);

// Calling actions (outside a component — e.g. in tests)
useAuthStore.getState().setAuth(user);
useAuthStore.getState().clearAuth();

// Resetting state in tests
useAuthStore.setState({ user: null, isReady: false });
```

## useCartStore

```ts
interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void; // adds new item or increments qty if id already exists
  remove: (id: string) => void; // removes by id
  clear: () => void; // empties cart
}

// Selector (exported separately — not on the store itself)
export const cartItemCount = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
```

**Key behaviour:**

- `add(item)` is idempotent by id — calling it twice with the same `id` increments `quantity` by 1 rather than duplicating the item.
- `cartItemCount` is a selector exported at the module level, not a computed value on the store. Use it with `useCartStore(cartItemCount)` for a reactive count.

```ts
import { useCartStore, cartItemCount } from '@/store/useCartStore';

// In a component
const items = useCartStore((s) => s.items);
const count = useCartStore(cartItemCount); // reactive total quantity
const { add, remove, clear } = useCartStore();
```

## Adding a New Store

```ts
// store/useProductStore.ts
import { create } from 'zustand';

interface ProductState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));
```

**Rules:**

- One store file per domain, named `use<Domain>Store.ts`
- Stores hold UI/client state only — not server data (use TanStack Query for that)
- Side effects that must happen on state changes (like clearing tokens) belong in the action, not in components
- Export selectors as standalone functions so they can be used without hooks (e.g. in tests via `getState()`)

## Testing

Stores can be tested without rendering any components. Reset state in `beforeEach` to prevent bleed between tests:

```ts
import { useAuthStore } from './useAuthStore';

beforeEach(() => {
  useAuthStore.setState({ user: null, isReady: false });
});

it('setAuth sets user and isReady', () => {
  useAuthStore
    .getState()
    .setAuth({ id: '1', phone: '0901234567', name: 'Alice', role: 'customer' });
  expect(useAuthStore.getState().user?.name).toBe('Alice');
  expect(useAuthStore.getState().isReady).toBe(true);
});
```
