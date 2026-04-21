## ADDED Requirements

### Requirement: Outlet model persists retail store locations
The system SHALL store outlets with a unique id, a required name, an optional address, and timestamps. Outlets are managed independently of users.

#### Scenario: Outlet is created with name and optional address
- **WHEN** an `Outlet` row is inserted with a name and no address
- **THEN** the row is persisted with a generated cuid id, the provided name, null address, and auto-populated timestamps

---

### Requirement: UserOutlet join table with per-membership role
The system SHALL persist the many-to-many relationship between `User` and `Outlet` via a `UserOutlet` table. Each membership SHALL have a role (`OWNER`, `MANAGER`, or `STAFF`).

#### Scenario: User is assigned to an outlet with a role
- **WHEN** a `UserOutlet` row is inserted with userId, outletId, and role `MANAGER`
- **THEN** the membership is persisted and queryable by userId

#### Scenario: Duplicate membership is rejected
- **WHEN** a `UserOutlet` row is inserted with a userId and outletId that already exists
- **THEN** the database rejects the insert with a unique constraint violation

#### Scenario: Deleting a user cascades to their memberships
- **WHEN** a `User` row is deleted
- **THEN** all associated `UserOutlet` rows for that user are automatically deleted

#### Scenario: Deleting an outlet cascades to its memberships
- **WHEN** an `Outlet` row is deleted
- **THEN** all associated `UserOutlet` rows for that outlet are automatically deleted

---

### Requirement: STAFF removed from global User role enum
The `Role` enum on the `User` model SHALL contain only `ADMIN` and `CUSTOMER`. The `STAFF` value SHALL be removed. Outlet-level staff roles are expressed via `UserOutlet.role`.

#### Scenario: Existing STAFF users are migrated before enum change
- **WHEN** the migration runs
- **THEN** any `User` rows with `role = 'STAFF'` SHALL be updated to `role = 'CUSTOMER'` before the enum value is dropped

#### Scenario: New user registration defaults to CUSTOMER
- **WHEN** a new user registers via `POST /auth/register`
- **THEN** the user's role SHALL be `CUSTOMER`

---

### Requirement: Outlet model includes optional code and imageUrl fields
The `Outlet` TypeScript interface SHALL include two new optional fields: `code` (a string identifier such as `CU000014603`) and `imageUrl` (a URL string for the outlet's avatar/thumbnail image). Both fields are optional and nullable — existing outlets without them remain valid.

#### Scenario: Outlet with code and imageUrl is correctly typed
- **WHEN** an outlet object is constructed with `code: "CU000014603"` and `imageUrl: "https://example.com/img.jpg"`
- **THEN** TypeScript accepts the object as a valid `Outlet` without type errors

#### Scenario: Outlet without code or imageUrl is still valid
- **WHEN** an outlet object is constructed without `code` or `imageUrl` fields
- **THEN** TypeScript accepts the object as a valid `Outlet` (fields are optional)
