## ADDED Requirements

### Requirement: Domain-scoped Zustand store files
The app SHALL organize Zustand stores into `src/store/use<Domain>Store.ts` files. Each file SHALL export a single store hook for a single domain (e.g., cart, auth). No store SHALL be defined inside a page or component file. Stores are used for client/UI state only — server state is managed by React Query.

#### Scenario: Cart store is used by multiple pages
- **WHEN** both the Cart tab and a Product page need cart item count
- **THEN** both SHALL import from `src/store/useCartStore.ts` without circular dependencies

#### Scenario: New domain state added
- **WHEN** a developer adds state for a new domain (e.g., orders UI state)
- **THEN** they SHALL create `src/store/useOrdersStore.ts` following the same pattern

---

### Requirement: Auth store shape
`src/store/useAuthStore.ts` SHALL export a `useAuthStore` hook with the following shape: `user: User | null`, `isReady: boolean`, `setAuth(user: User): void`, `clearAuth(): void`. Token storage is handled by `nativeStorage`, not Zustand — the store holds only the in-memory user object and app-ready flag.

#### Scenario: Auth store exists with correct shape
- **WHEN** a component imports from `src/store/useAuthStore.ts`
- **THEN** it SHALL find `user`, `isReady`, `setAuth`, and `clearAuth`

#### Scenario: setAuth updates user in store
- **WHEN** `setAuth(user)` is called after a successful login or register
- **THEN** `useAuthStore.user` SHALL be set to the provided user and `isReady` SHALL be `true`

#### Scenario: clearAuth resets store
- **WHEN** `clearAuth()` is called
- **THEN** `useAuthStore.user` SHALL be set to `null`

#### Scenario: isReady gates route rendering
- **WHEN** `isReady` is `false` (during app init rehydration)
- **THEN** `ProtectedRoute` SHALL not render its children, allowing `AuthProvider` to show `SplashPage`

---

### Requirement: Initial store files for cart and auth domains
The structure SHALL ship with initial store files for the two domains needed by the navigation shell: `src/store/useCartStore.ts` (cart item count for badge) and `src/store/useAuthStore.ts` (logged-in user identity, ready state, and auth actions).

#### Scenario: Cart count store exists
- **WHEN** a component imports from `src/store/useCartStore.ts`
- **THEN** it SHALL find a `useCartStore` hook exposing cart items and actions

#### Scenario: Auth store exists
- **WHEN** a component imports from `src/store/useAuthStore.ts`
- **THEN** it SHALL find a `useAuthStore` hook exposing `user`, `isReady`, `setAuth`, and `clearAuth`

---

### Requirement: Stores are typed with TypeScript
All store definitions SHALL use explicit TypeScript interfaces so that consumers get type checking at import time.

#### Scenario: Wrong type assigned to store state
- **WHEN** a developer writes a value of the wrong type to a store
- **THEN** TypeScript SHALL report a compile-time error

---

### Requirement: No Provider required
Zustand stores SHALL be importable and usable in any component without wrapping the tree in a Provider.

#### Scenario: Using a store in a deeply nested component
- **WHEN** a component at any depth in the tree calls `useAuthStore()`
- **THEN** it SHALL receive the current state without any Provider in the component tree
