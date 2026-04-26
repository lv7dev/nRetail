## Context

DMS (Distributor Management System) is the authoritative source for outlet-to-user assignments. It inserts `UserOutlet` rows directly into the database. The app currently treats any `UserOutlet` row as an active ("Connected") membership and shows all outlets with *no* row in the "Not Connected" tab. This is wrong — "Not Connected" should only show outlets DMS has explicitly assigned to the user that the user hasn't yet confirmed.

Current state:
- `UserOutlet` has no status field — a row means "connected"
- `GET /outlets?connected=false` returns all outlets in the system without a `UserOutlet` row
- `OutletItem` has a placeholder "Connect" button that does nothing

## Goals / Non-Goals

**Goals:**
- Add `status` to `UserOutlet`: `PENDING` (DMS-assigned, unacted), `CONFIRMED` (user accepted), `REJECTED` (user declined)
- Existing rows migrate to `CONFIRMED` — they are already active memberships
- `connected=false` returns only DMS-assigned outlets in PENDING or REJECTED state
- New endpoint lets users confirm or reject a membership
- REJECTED is reversible — user can still confirm later via the Connect button
- `GET /outlets/mine` updated to return only `CONFIRMED` memberships

**Non-Goals:**
- No in-app outlet creation — DMS owns that
- No admin UI for membership management
- No notifications on new DMS assignments
- No role changes via the app

## Decisions

### Decision 1: Status lives on UserOutlet, not a separate table
A `status` column on `UserOutlet` is the minimal change. A separate `PendingMembership` table would add join complexity for no benefit, since all states are about the same user↔outlet relationship.

*Alternatives considered:* Separate `PendingMembership` table → rejected (unnecessary join complexity).

### Decision 2: Existing rows migrate to CONFIRMED, not PENDING
Rows created before this change are already active memberships the user is operating within. Making them PENDING would incorrectly re-prompt existing users to confirm their own outlets.

*Alternatives considered:* Default all rows to PENDING → rejected (breaks existing users).

### Decision 3: `connected=false` scope narrows to DMS-assigned only
"Not Connected" no longer means "all outlets in the universe without a membership." It means "outlets DMS has assigned to me that I haven't confirmed." This eliminates the privacy/noise problem of showing every outlet in the system to every user.

*Alternatives considered:* Keep showing all outlets + also show DMS-assigned → rejected (confusing dual meaning, no clear action path for arbitrary outlets).

### Decision 4: REJECTED is reversible via the same Connect button
Rejection is a soft signal ("not right now") rather than a permanent block. The Connect button remains visible on REJECTED items so users can change their mind. This avoids a separate "undo reject" flow.

*Alternatives considered:* Hard delete the UserOutlet row on reject → rejected (DMS would re-create it on next sync, causing an infinite loop).

### Decision 5: Single PATCH endpoint for both confirm and reject
`PATCH /outlets/:outletId/membership` with `{ action: "confirm" | "reject" }` is simpler than two separate endpoints. The action is mutually exclusive, so one endpoint with a discriminated body is clean.

*Alternatives considered:* `POST /outlets/:outletId/confirm` + `POST /outlets/:outletId/reject` → rejected (unnecessary endpoint proliferation for what is one state machine).

### Decision 6: Response includes `membershipStatus` for not-connected items
The frontend needs to distinguish PENDING from REJECTED to render the correct UI (two buttons vs. label-only). Adding `membershipStatus` to the `connected=false` response avoids a separate fetch.

## Risks / Trade-offs

- **Migration safety**: Adding a nullable column then backfilling is safe. We add `status` with a default of `CONFIRMED` (not PENDING) so existing rows are immediately valid without a slow backfill. New DMS-inserted rows will default to `PENDING` via Prisma schema default after deployment. → Risk: low.
- **DMS sync race**: If DMS re-inserts a row after the user rejects, the unique constraint on `(userId, outletId)` will block it. DMS should `UPSERT` and respect the existing `status` on conflict. → Mitigation: document this constraint for DMS team; the app does not break either way since it handles all states.
- **`/outlets/mine` callers**: Anything calling `/mine` today gets all memberships; after this change it gets only `CONFIRMED`. Any code path relying on seeing PENDING outlets via `/mine` will be affected. Current app only uses `/mine` for the Connected tab context — this is the correct behaviour.

## Migration Plan

1. Add `UserOutletStatus` enum to Prisma schema
2. Add `status UserOutletStatus @default(PENDING)` to `UserOutlet`
3. Generate migration with `prisma migrate dev`
4. Edit the generated SQL: change default to `CONFIRMED` for the `ALTER TABLE` statement and add a backfill: `UPDATE "UserOutlet" SET status = 'CONFIRMED' WHERE status = 'PENDING'` — so all existing rows become CONFIRMED before any app code runs
5. After migration, the schema default reverts to `PENDING` for new rows inserted by DMS
6. Deploy backend, then frontend — backend is backwards-compatible (new field, old behavior preserved for CONFIRMED rows)

**Rollback**: The `status` column can be dropped without breaking existing functionality — all queries would simply ignore it and treat all rows as connected again.

## Open Questions

- Does DMS use `INSERT` or `UPSERT`? If `INSERT`, the unique constraint will cause errors when re-assigning a previously rejected outlet. DMS should use `INSERT ... ON CONFLICT DO NOTHING` or `UPSERT` with a status reset to `PENDING`.
