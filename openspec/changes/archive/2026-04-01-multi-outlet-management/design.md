## Context

nRetail is a retail platform where staff, managers, and owners operate physical store locations ("outlets"). Currently the system has a flat user model with a single global role and no outlet concept. The miniapp goes directly to the app after login with no location context.

This design introduces multi-outlet management: a many-to-many relationship between users and outlets with per-membership roles, an outlet selection gate in the frontend, and persistence of the selected outlet across sessions.

## Goals / Non-Goals

**Goals:**
- Users can belong to zero, one, or many outlets with distinct roles per outlet
- After login, users must select an outlet before accessing app features
- Single-outlet users are auto-forwarded (no redundant picker screen)
- Selected outlet persists across app restarts; cleared on logout
- Users can re-select their outlet via the AppLayout header
- Empty state handled gracefully (zero outlets → informative screen + logout)

**Non-Goals:**
- Outlet CRUD management UI (create/edit/delete outlets — admin-only, out of scope)
- User ↔ outlet assignment UI (out of scope for this change)
- Passing outlet context to existing API endpoints (deferred — no endpoint changes beyond `/outlets/mine`)
- Real-time outlet role updates (no WebSocket; a page reload picks up changes)

## Decisions

### D1: Role per membership, not per user

**Decision:** `UserOutlet.role` (OWNER / MANAGER / STAFF) replaces the old global `STAFF` role. `User.role` retains only `ADMIN` and `CUSTOMER` for platform-level authorization.

**Rationale:** A user can be MANAGER at one outlet and STAFF at another — a global role cannot express this. Keeping `ADMIN` and `CUSTOMER` on `User` covers platform-level concerns (super-admin bypass, customer accounts) without forcing every user into outlet membership.

**Alternative considered:** Single unified role enum on `UserOutlet` only, removing `User.role` entirely. Rejected because it would require all routes to check outlet membership even for platform-level admin actions.

---

### D2: `OutletGuard` as a second route guard in series

**Decision:** The routing chain is `ProtectedRoute` → `OutletGuard` → `AppLayout`. `OutletGuard` reads `useOutletStore.selectedOutlet`; if null, redirects to `/outlets`.

**Rationale:** Mirrors the existing `ProtectedRoute` pattern — small, focused components with a single responsibility. `OutletGuard` does not fetch anything; it only checks store state. This keeps it synchronous and avoids layout flash.

**Alternative considered:** Merging outlet logic into `ProtectedRoute`. Rejected — violates single responsibility and couples auth state to outlet state.

---

### D3: Selected outlet persisted via Zustand `persist` middleware

**Decision:** `useOutletStore` uses Zustand's `persist` middleware with `localStorage`. On app restart, the store is rehydrated before first render.

**Rationale:** Consistent with the project's Zustand-for-client-state pattern. `persist` gives us localStorage sync for free without custom effects. `nativeStorage` (Zalo native storage) is used only for auth tokens — outlet selection is UI state, not a security credential, so `localStorage` is appropriate.

**Alternative considered:** Storing `selectedOutletId` in the JWT. Rejected — the JWT is issued at login, before outlet selection. Re-issuing a JWT per outlet selection adds backend complexity with no security benefit at this stage.

---

### D4: Auto-select for single-outlet users happens in `OutletListPage`

**Decision:** `OutletListPage` fetches `/outlets/mine`. If the result has exactly 1 outlet, it immediately calls `setSelectedOutlet` and navigates to `/` without rendering the list.

**Rationale:** The guard only checks "is an outlet selected?" — it does not know how many outlets the user has. Keeping the auto-select logic in the page component makes it testable in isolation and does not block the guard's synchronous operation.

**Alternative considered:** Auto-select in `OutletGuard` by fetching `/outlets/mine` there. Rejected — guards should not perform async operations; this would cause a loading flash on every protected route render.

---

### D5: Re-select via tappable outlet name in `AppLayout` header

**Decision:** The AppLayout header shows the current outlet name. Tapping it navigates to `/outlets`. The outlet store is NOT cleared on tap — the user can tap Back if they change their mind.

**Rationale:** Always-visible affordance is better UX than a buried profile button. Not clearing the store on tap means the user retains their current context if they navigate back without picking a new outlet.

---

### D6: `clearAuth` also clears selected outlet

**Decision:** `useAuthStore.clearAuth()` calls `useOutletStore.getState().clearSelectedOutlet()` directly.

**Rationale:** Logout must reset all session-scoped state. Coupling in the store layer is acceptable because auth clearing is the canonical "end session" action. An alternative (event-based decoupling) would be over-engineering for two stores.

## Risks / Trade-offs

- **Stale outlet in localStorage** → If an admin removes a user from an outlet while they're logged in, their stored `selectedOutlet` becomes stale. The app will continue to work (no API enforcement yet — deferred per Non-Goals). When outlet-scoped API authorization is added later, the backend will reject requests, prompting re-selection. Acceptable for now.

- **Auto-select surprises** → A user newly added to a second outlet won't know about it until they log out and back in (or revisit `/outlets`). Acceptable — the header tap affords re-selection without logout.

- **Global Role enum migration** → Removing `STAFF` from `Role` is a breaking schema change. Any existing users with `role = 'STAFF'` must be migrated before the migration runs. The migration plan includes a data migration step.

## Migration Plan

1. **Backend schema migration**
   - Add `Outlet` and `UserOutlet` tables, `OutletRole` enum
   - Data migration: update any `User` rows with `role = 'STAFF'` to `role = 'CUSTOMER'` (or `ADMIN` if appropriate — coordinate with ops)
   - Remove `STAFF` from `Role` enum in a separate migration step (after data migration)

2. **Backend code**
   - Deploy `outlets` module with `GET /outlets/mine`
   - Update any guards/decorators that reference `Role.STAFF`

3. **Frontend**
   - Deploy outlet store, guard, and page
   - All existing users with a stored session will hit `OutletGuard` → `/outlets` on next visit

4. **Rollback**
   - Re-add `STAFF` to enum, remove `OutletGuard` from routing
   - Data loss risk: none (outlet tables can be dropped cleanly)

## Open Questions

- Should `GET /outlets/mine` also return the outlet's current operational status (open/closed)? Deferred — no operational status concept exists yet.
- Should platform `ADMIN` users bypass `OutletGuard` entirely? Likely yes — but deferred until admin panel work begins.
