## ADDED Requirements

### Requirement: UserOutlet membership status lifecycle
The system SHALL support a `status` field on `UserOutlet` with three values: `PENDING` (DMS-assigned, user has not acted), `CONFIRMED` (user accepted the assignment), and `REJECTED` (user declined but can still confirm later). DMS inserts rows; users transition status via the app.

#### Scenario: DMS-inserted row defaults to PENDING
- **WHEN** DMS inserts a new `UserOutlet` row without specifying `status`
- **THEN** the row is persisted with `status = PENDING`

#### Scenario: Existing rows at migration time are CONFIRMED
- **WHEN** the migration runs on a database with existing `UserOutlet` rows
- **THEN** all pre-existing rows have `status = CONFIRMED` (they are already active memberships)

---

### Requirement: User can confirm a PENDING membership
The system SHALL expose `PATCH /outlets/:outletId/membership` accepting `{ action: "confirm" }`. The authenticated user's `UserOutlet` row for that outlet SHALL transition to `CONFIRMED`.

#### Scenario: Confirming a PENDING membership
- **WHEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "confirm" }` and the user has a `PENDING` `UserOutlet` row for that outlet
- **THEN** the row's `status` changes to `CONFIRMED` and the response returns `200 OK`

#### Scenario: Confirming a REJECTED membership (re-confirm)
- **WHEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "confirm" }` and the user has a `REJECTED` `UserOutlet` row
- **THEN** the row's `status` changes to `CONFIRMED` and the response returns `200 OK`

#### Scenario: Confirming non-existent membership returns 404
- **WHEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "confirm" }` but no `UserOutlet` row exists for that user+outlet
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated confirm is rejected
- **WHEN** `PATCH /outlets/:outletId/membership` is called without a valid JWT
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: User can reject a PENDING membership
The system SHALL accept `{ action: "reject" }` on `PATCH /outlets/:outletId/membership`. The `UserOutlet` row SHALL transition to `REJECTED`. The row is NOT deleted — rejection is soft.

#### Scenario: Rejecting a PENDING membership
- **WHEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "reject" }` and the user has a `PENDING` `UserOutlet` row
- **THEN** the row's `status` changes to `REJECTED` and the response returns `200 OK`

#### Scenario: Rejecting a CONFIRMED membership is not allowed
- **WHEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "reject" }` and the row is `CONFIRMED`
- **THEN** the system returns `422 Unprocessable Entity` (cannot un-confirm via reject)

#### Scenario: DMS removal clears the outlet from Not Connected
- **WHEN** DMS deletes the `UserOutlet` row for a `REJECTED` membership
- **THEN** the outlet no longer appears in the user's Not Connected tab (cascade delete still applies)
