## ADDED Requirements

### Requirement: Outlet store holds the selected outlet with persistence
The app SHALL have `src/store/useOutletStore.ts` exporting a `useOutletStore` hook. The store SHALL hold `selectedOutlet: Outlet | null`, `setSelectedOutlet(outlet: Outlet): void`, and `clearSelectedOutlet(): void`. The store SHALL use Zustand `persist` middleware backed by `localStorage` so the selection survives page reloads.

#### Scenario: Outlet store exists with correct shape
- **WHEN** a component imports from `src/store/useOutletStore.ts`
- **THEN** it SHALL find `selectedOutlet`, `setSelectedOutlet`, and `clearSelectedOutlet`

#### Scenario: setSelectedOutlet stores the outlet
- **WHEN** `setSelectedOutlet(outlet)` is called
- **THEN** `useOutletStore.selectedOutlet` SHALL be set to the provided outlet and persisted to `localStorage`

#### Scenario: clearSelectedOutlet resets the store
- **WHEN** `clearSelectedOutlet()` is called
- **THEN** `useOutletStore.selectedOutlet` SHALL be `null` and the persisted value removed from `localStorage`

#### Scenario: Selected outlet is rehydrated on app restart
- **WHEN** the app starts and `localStorage` contains a previously persisted outlet
- **THEN** `useOutletStore.selectedOutlet` SHALL be populated before the first render

---

### Requirement: clearAuth clears selected outlet
`useAuthStore.clearAuth()` SHALL call `useOutletStore.getState().clearSelectedOutlet()` so that logging out always resets outlet context.

#### Scenario: Logout clears the outlet store
- **WHEN** `clearAuth()` is called (e.g., user taps logout)
- **THEN** `useOutletStore.selectedOutlet` SHALL be `null` after the call

## MODIFIED Requirements

### Requirement: Auth store shape
`src/store/useAuthStore.ts` SHALL export a `useAuthStore` hook with the following shape: `user: User | null`, `isReady: boolean`, `setAuth(user: User): void`, `clearAuth(): void`. Token storage is handled by `nativeStorage`, not Zustand. `clearAuth()` SHALL also clear outlet state by calling `useOutletStore.getState().clearSelectedOutlet()`.

#### Scenario: Auth store exists with correct shape
- **WHEN** a component imports from `src/store/useAuthStore.ts`
- **THEN** it SHALL find `user`, `isReady`, `setAuth`, and `clearAuth`

#### Scenario: setAuth updates user in store
- **WHEN** `setAuth(user)` is called after a successful login or register
- **THEN** `useAuthStore.user` SHALL be set to the provided user and `isReady` SHALL be `true`

#### Scenario: clearAuth resets auth store and outlet store
- **WHEN** `clearAuth()` is called
- **THEN** `useAuthStore.user` SHALL be set to `null` AND `useOutletStore.selectedOutlet` SHALL be `null`

#### Scenario: isReady gates route rendering
- **WHEN** `isReady` is `false` (during app init rehydration)
- **THEN** `ProtectedRoute` SHALL not render its children, allowing `AuthProvider` to show `SplashPage`
