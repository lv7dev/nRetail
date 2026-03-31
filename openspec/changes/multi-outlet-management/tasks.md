## 1. Backend — Schema & Migration

- [x] 1.1 Add `Outlet` model to `schema.prisma` (id, name, address?, timestamps)
- [x] 1.2 Add `OutletRole` enum (`OWNER`, `MANAGER`, `STAFF`) to `schema.prisma`
- [x] 1.3 Add `UserOutlet` model to `schema.prisma` (userId, outletId, role, unique constraint, cascade deletes, userId index)
- [x] 1.4 Add `memberships UserOutlet[]` relation to `User` model in `schema.prisma`
- [x] 1.5 Create migration: add `Outlet`, `UserOutlet`, `OutletRole`
- [x] 1.6 Create migration: data-migrate any `User.role = 'STAFF'` → `'CUSTOMER'`, then remove `STAFF` from `Role` enum
- [x] 1.7 Run `prisma generate` and verify types compile

## 2. Backend — Outlets Module

- [x] 2.1 Create `src/modules/outlets/` with `outlets.module.ts`, `outlets.controller.ts`, `outlets.service.ts`, `outlets.repository.ts`
- [x] 2.2 Create `dto/my-outlet.response.ts` (id, name, address, role — typed with `OutletRole`)
- [x] 2.3 Implement `OutletsRepository.findByUserId(userId)` — join `UserOutlet` + `Outlet`, return flat list with role
- [x] 2.4 Implement `OutletsService.getMyOutlets(userId)` — delegates to repository
- [x] 2.5 Implement `GET /outlets/mine` in controller — `@UseGuards(JwtAuthGuard)`, `@CurrentUser()`, returns `MyOutletResponse[]`
- [x] 2.6 Register `OutletsModule` in `AppModule`
- [x] 2.7 Write unit tests: `outlets.repository.spec.ts`, `outlets.service.spec.ts`, `outlets.controller.spec.ts`
- [x] 2.8 Write integration test: `GET /outlets/mine` with 0, 1, and N outlet memberships; unauthenticated → 401

## 3. Backend — Seed Data

- [x] 3.1 Create seed script (or extend existing) to insert at least two `Outlet` rows and assign the dev test user to both with different roles

## 4. Frontend — Outlet Store

- [x] 4.1 Add `Outlet` type to `src/types/` (id, name, address, role)
- [x] 4.2 Create `src/store/useOutletStore.ts` with `selectedOutlet`, `setSelectedOutlet`, `clearSelectedOutlet`, Zustand `persist` to localStorage
- [x] 4.3 Write unit tests for `useOutletStore` (set, clear, persistence key)

## 5. Frontend — Auth Store Update

- [x] 5.1 Update `useAuthStore.clearAuth()` to call `useOutletStore.getState().clearSelectedOutlet()`
- [x] 5.2 Update `useAuthStore` unit tests: `clearAuth` scenario now asserts outlet store is also cleared

## 6. Frontend — Outlet Service

- [x] 6.1 Create `src/services/outletService.ts` with `getMyOutlets()` — calls `GET /outlets/mine`, returns `Outlet[]`
- [x] 6.2 Add MSW handler for `GET /outlets/mine` to `src/mocks/handlers.ts`

## 7. Frontend — OutletGuard & Routing

- [x] 7.1 Create `src/components/shared/OutletGuard.tsx` — reads `useOutletStore.selectedOutlet`; if null, `<Navigate to="/outlets" />`; else `<Outlet />`
- [x] 7.2 Write unit tests for `OutletGuard` (no outlet → redirect, outlet present → renders children)
- [x] 7.3 Update `app.tsx` routing: add `/outlets` route inside `ProtectedRoute`, wrap `AppLayout` routes with `OutletGuard`

## 8. Frontend — OutletListPage

- [x] 8.1 Create `src/pages/outlets/index.tsx` — fetches `getMyOutlets()`, handles loading state
- [x] 8.2 Implement auto-select: if exactly 1 outlet, call `setSelectedOutlet` and navigate to `/` without rendering list
- [x] 8.3 Implement outlet list: render tappable list items; on tap call `setSelectedOutlet` and navigate to `/`
- [x] 8.4 Implement empty state: 0 outlets → message + logout button (calls `clearAuth()`)
- [x] 8.5 Write unit tests for `OutletListPage` (auto-select, list render, empty state, tap behavior)
- [x] 8.6 Write integration test for `OutletListPage` (MSW: 0 outlets, 1 outlet auto-select, multiple outlets list)

## 9. Frontend — AppLayout Header

- [x] 9.1 Update `AppLayout.tsx` to read `useOutletStore.selectedOutlet` and display outlet name in header
- [x] 9.2 Make outlet name a tappable element that calls `navigate('/outlets')`
- [x] 9.3 Update `AppLayout` unit tests to assert outlet name is displayed and tap navigates to `/outlets`
