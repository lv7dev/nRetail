## Why

Users (staff, managers, owners) need to manage multiple physical retail outlets, and a single outlet can have multiple users with different roles. Currently the app has no concept of outlets — after login users land directly in the app with no outlet context, making multi-location retail operations impossible.

## What Changes

- Add `Outlet` entity and `UserOutlet` join table to the database (many-to-many between `User` and `Outlet`, with a per-membership role)
- Remove `STAFF` from the global `User.role` enum — outlet-level roles replace it
- Add `GET /outlets/mine` API endpoint returning the logged-in user's outlets with their role in each
- Add an outlet selection screen: after login, users must pick an outlet before accessing any app features
- Auto-select and skip the picker if the user belongs to exactly one outlet
- Persist the selected outlet across app restarts; clear it on logout
- Add a re-select control in the AppLayout header (current outlet name is tappable → returns to outlet picker)
- Empty state for users with zero outlet assignments (show message + logout button)

## Capabilities

### New Capabilities

- `outlet-data-model`: Prisma schema for `Outlet`, `UserOutlet`, `OutletRole` enum; migration; removal of `STAFF` from `User.role`
- `outlet-api`: `GET /outlets/mine` endpoint — returns outlets the authenticated user is a member of, including their role per outlet
- `outlet-selection-flow`: Frontend flow — outlet picker page, auto-select logic, empty state, persist selected outlet in Zustand + localStorage, clear on logout
- `outlet-context-ui`: AppLayout header shows current outlet name; tapping it navigates back to the outlet picker (re-select)

### Modified Capabilities

- `user-identity`: Remove `STAFF` from `Role` enum — the enum now only has `ADMIN` and `CUSTOMER`; outlet-level roles live in `UserOutlet.role`
- `state-management`: `useAuthStore.clearAuth` must also clear the selected outlet from `useOutletStore`
- `app-rehydration`: After token rehydration, the outlet guard must check for a persisted outlet before allowing access to app routes

## Impact

- **Backend**: New Prisma migration, new `outlets` NestJS module, `User` model gets `memberships UserOutlet[]` relation, `Role` enum loses `STAFF`
- **Frontend**: New `useOutletStore`, new `OutletGuard` component, new `OutletListPage`, routing changes in `app.tsx`, `AppLayout` header updated
- **Auth flow**: `ProtectedRoute` → `OutletGuard` → `AppLayout` (two guards in series)
- **Logout**: Must clear both auth tokens and selected outlet
- **No breaking changes to existing app routes** — outlet guard is additive; existing pages are unchanged
