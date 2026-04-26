## 1. Data Model — UserOutlet Status

- [x] 1.1 Add `UserOutletStatus` enum (`PENDING`, `CONFIRMED`, `REJECTED`) to `prisma/schema.prisma`
- [x] 1.2 Add `status UserOutletStatus @default(PENDING)` field to `UserOutlet` model
- [x] 1.3 Generate migration with `prisma migrate dev --name add-user-outlet-status`
- [x] 1.4 Edit generated SQL: set default to `CONFIRMED` for the new column and add `UPDATE "UserOutlet" SET status = 'CONFIRMED'` backfill before the default change

## 2. Backend — GET /outlets Filter Logic

- [x] 2.1 Write failing test: `GET /outlets?connected=true` returns only `CONFIRMED` memberships
- [x] 2.2 Update `outlets.service.ts` `getOutlets()` to filter `status = CONFIRMED` when `connected=true`
- [x] 2.3 Write failing test: `GET /outlets?connected=false` returns only `PENDING` and `REJECTED` memberships (not all non-member outlets)
- [x] 2.4 Update `getOutlets()` to query `UserOutlet` where `status IN (PENDING, REJECTED)` when `connected=false`
- [x] 2.5 Write failing test: `connected=false` response items include `membershipStatus` field
- [x] 2.6 Add `membershipStatus` to the outlet DTO/response mapper for `connected=false` items

## 3. Backend — GET /outlets/mine

- [x] 3.1 Write failing test: `GET /outlets/mine` excludes `PENDING` and `REJECTED` memberships
- [x] 3.2 Update `outlets.service.ts` `getMine()` (or equivalent) to filter `status = CONFIRMED`

## 4. Backend — PATCH /outlets/:outletId/membership

- [x] 4.1 Create `UpdateMembershipDto` with `action: 'confirm' | 'reject'` and class-validator decorators
- [x] 4.2 Write failing test: `PATCH /outlets/:outletId/membership { action: "confirm" }` transitions PENDING → CONFIRMED
- [x] 4.3 Write failing test: `PATCH /outlets/:outletId/membership { action: "confirm" }` transitions REJECTED → CONFIRMED (re-confirm)
- [x] 4.4 Write failing test: `PATCH /outlets/:outletId/membership { action: "reject" }` transitions PENDING → REJECTED
- [x] 4.5 Write failing test: `PATCH /outlets/:outletId/membership { action: "reject" }` on a CONFIRMED row returns 422
- [x] 4.6 Write failing test: `PATCH /outlets/:outletId/membership` with no matching row returns 404
- [x] 4.7 Implement `updateMembership(userId, outletId, action)` in `outlets.service.ts`
- [x] 4.8 Add `PATCH /:outletId/membership` route to `outlets.controller.ts` with `JwtAuthGuard`

## 5. Frontend — Types and Service

- [x] 5.1 Write failing test: `outletService.updateMembership()` calls `PATCH /outlets/:outletId/membership`
- [x] 5.2 Add `membershipStatus?: 'PENDING' | 'REJECTED'` to the `Outlet` TypeScript type
- [x] 5.3 Add `updateMembership(outletId: string, action: 'confirm' | 'reject')` to `outletService`

## 6. Frontend — OutletItem UI States

- [x] 6.1 Write failing test: `OutletItem` with `connected=false` and `membershipStatus="PENDING"` renders outlined "Not My Outlet" button and filled "Connect" button
- [x] 6.2 Write failing test: `OutletItem` with `connected=false` and `membershipStatus="REJECTED"` renders plain "Not My Outlet" label and "Connect" button only (no reject button)
- [x] 6.3 Update `OutletItem` props to accept `membershipStatus` and `onReject` callback
- [x] 6.4 Implement PENDING state rendering in `OutletItem`
- [x] 6.5 Implement REJECTED state rendering in `OutletItem`

## 7. Frontend — OutletListPage Mutations

- [x] 7.1 Write failing integration test: tapping Connect calls confirm mutation and invalidates both query caches
- [x] 7.2 Write failing integration test: tapping "Not My Outlet" calls reject mutation and invalidates `connected=false` cache
- [x] 7.3 Add `useMutation` for confirm in `OutletListPage`, wired to `outletService.updateMembership(id, 'confirm')`
- [x] 7.4 Add `useMutation` for reject in `OutletListPage`, wired to `outletService.updateMembership(id, 'reject')`
- [x] 7.5 Pass `onConnect` and `onReject` callbacks to `OutletItem` in the Not Connected panel
- [x] 7.6 Invalidate `['outlets', { connected: true }]` and `['outlets', { connected: false }]` on confirm success
- [x] 7.7 Invalidate `['outlets', { connected: false }]` on reject success
