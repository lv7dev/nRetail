## MODIFIED Requirements

### Requirement: UserOutlet join table with per-membership role
The system SHALL persist the many-to-many relationship between `User` and `Outlet` via a `UserOutlet` table. Each membership SHALL have a role (`OWNER`, `MANAGER`, or `STAFF`) and a `status` (`PENDING`, `CONFIRMED`, or `REJECTED`). New rows inserted by DMS default to `PENDING`. Rows created before the status migration default to `CONFIRMED`.

#### Scenario: User is assigned to an outlet with a role
- **WHEN** a `UserOutlet` row is inserted with userId, outletId, and role `MANAGER`
- **THEN** the membership is persisted with `status = PENDING` and is queryable by userId

#### Scenario: Duplicate membership is rejected
- **WHEN** a `UserOutlet` row is inserted with a userId and outletId that already exists
- **THEN** the database rejects the insert with a unique constraint violation

#### Scenario: Deleting a user cascades to their memberships
- **WHEN** a `User` row is deleted
- **THEN** all associated `UserOutlet` rows for that user are automatically deleted

#### Scenario: Deleting an outlet cascades to its memberships
- **WHEN** an `Outlet` row is deleted
- **THEN** all associated `UserOutlet` rows for that outlet are automatically deleted

#### Scenario: Pre-migration rows get CONFIRMED status
- **WHEN** the status migration runs on a database with existing `UserOutlet` rows
- **THEN** all pre-existing rows are updated to `status = CONFIRMED`
