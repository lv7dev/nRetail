## ADDED Requirements

### Requirement: Authenticated user can retrieve their outlet memberships
The system SHALL expose `GET /outlets/mine` protected by `JwtAuthGuard`. It SHALL return all outlets the authenticated user is a member of, including the user's role in each outlet.

#### Scenario: User with multiple outlets gets full list
- **WHEN** `GET /outlets/mine` is called with a valid JWT for a user who is a member of two outlets
- **THEN** the response contains both outlets, each with `id`, `name`, `address`, and `role`

#### Scenario: User with one outlet gets a single-item list
- **WHEN** `GET /outlets/mine` is called for a user with exactly one outlet membership
- **THEN** the response contains a list with one item

#### Scenario: User with no outlets gets an empty list
- **WHEN** `GET /outlets/mine` is called for a user with no outlet memberships
- **THEN** the response contains an empty list (`data: []`) with status 200

#### Scenario: Unauthenticated request is rejected
- **WHEN** `GET /outlets/mine` is called without a valid JWT
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Outlet API response shape
The `GET /outlets/mine` response SHALL wrap results in the standard `{ data: [...] }` envelope. Each item SHALL include `id`, `name`, `address` (nullable), and `role` (the caller's role in that outlet).

#### Scenario: Response shape is correct
- **WHEN** `GET /outlets/mine` returns results
- **THEN** each item in `data` SHALL have `id` (string), `name` (string), `address` (string or null), and `role` (`OWNER` | `MANAGER` | `STAFF`)
