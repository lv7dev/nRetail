## Why

DMS (Distributor Management System) assigns outlets to users externally — the app has no "add outlet" flow. Currently the app shows all system outlets not belonging to a user in the "Not Connected" tab, but there is no mechanism for users to act on DMS-assigned outlets. Users need a way to confirm or reject outlets that DMS has mapped to them, so only intentional memberships appear in their Connected list.

## What Changes

- **BREAKING** `UserOutlet` gains a `status` field (`PENDING` | `CONFIRMED` | `REJECTED`). All existing rows default to `CONFIRMED` (they were already active memberships).
- `GET /outlets?connected=true` now filters `status = CONFIRMED` only.
- `GET /outlets?connected=false` now returns only outlets where `UserOutlet.status IN (PENDING, REJECTED)` for the authenticated user — no longer shows all unassigned outlets.
- `GET /outlets/mine` updated to return only `status = CONFIRMED` memberships.
- New `PATCH /outlets/:outletId/membership` endpoint to confirm or reject a pending membership.
- Response for `connected=false` items includes a `membershipStatus` field (`PENDING` | `REJECTED`).
- `OutletItem` in the Not Connected tab renders two distinct states: PENDING (outlined "Not My Outlet" reject button + filled "Connect" button) and REJECTED ("Not My Outlet" plain label + "Connect" button only).

## Capabilities

### New Capabilities
- `outlet-membership-status`: `UserOutlet` status lifecycle — PENDING (DMS-assigned), CONFIRMED (user-accepted), REJECTED (user-declined). Includes the confirm/reject API endpoint.

### Modified Capabilities
- `outlet-data-model`: `UserOutlet` gains a `status` field; semantics of "connected" and "not connected" change.
- `outlet-api`: `GET /outlets` filter logic changes; response shape gains `membershipStatus`; `GET /outlets/mine` filters by `CONFIRMED`.
- `outlet-list-ui`: Not Connected tab scope narrows to DMS-assigned outlets; `OutletItem` gains PENDING vs REJECTED UI states with confirm/reject actions.

## Impact

- **Backend**: `prisma/schema.prisma`, new migration, `outlets.service.ts`, `outlets.controller.ts`, new DTO
- **Frontend**: `src/types/outlet.ts`, `outletService.ts`, `OutletItem`, `OutletListPage`
- **Data migration**: Existing `UserOutlet` rows get `status = CONFIRMED` (not PENDING — they are already active)
- **No DMS-side changes** — DMS continues inserting `UserOutlet` rows; new rows land as `PENDING` by default
