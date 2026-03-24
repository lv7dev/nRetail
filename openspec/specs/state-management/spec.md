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

### Requirement: Initial store files for cart and auth domains
The structure SHALL ship with initial store files for the two domains needed by the navigation shell: `src/store/useCartStore.ts` (cart item count for badge) and `src/store/useAuthStore.ts` (logged-in user identity).

#### Scenario: Cart count store exists
- **WHEN** a component imports from `src/store/useCartStore.ts`
- **THEN** it SHALL find a `useCartStore` hook exposing cart items and actions

#### Scenario: Auth store exists
- **WHEN** a component imports from `src/store/useAuthStore.ts`
- **THEN** it SHALL find a `useAuthStore` hook exposing current user (or null) and auth actions

---

### Requirement: Stores are typed with TypeScript
All store definitions SHALL use explicit TypeScript interfaces so that consumers get type checking at import time.

#### Scenario: Wrong type assigned to store state
- **WHEN** a developer writes a value of the wrong type to a store
- **THEN** TypeScript SHALL report a compile-time error

---

### Requirement: No Provider required
Zustand stores SHALL be importable and usable in any component without wrapping the tree in a Provider. This is the default Zustand behavior and SHALL be preserved (no custom context wrappers).

#### Scenario: Using a store in a deeply nested component
- **WHEN** a component at any depth in the tree calls `useCartStore()`
- **THEN** it SHALL receive the current state without any Provider in the component tree
