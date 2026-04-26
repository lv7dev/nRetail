## MODIFIED Requirements

### Requirement: Authenticated user can retrieve their outlet memberships
The system SHALL expose `GET /outlets/mine` protected by `JwtAuthGuard`. It SHALL return only outlets where the authenticated user's `UserOutlet.status = CONFIRMED`, including the user's role in each outlet.

#### Scenario: User with multiple confirmed outlets gets full list
- **WHEN** `GET /outlets/mine` is called with a valid JWT for a user who has two `CONFIRMED` memberships
- **THEN** the response contains both outlets, each with `id`, `name`, `address`, and `role`

#### Scenario: PENDING and REJECTED memberships are excluded from /mine
- **WHEN** `GET /outlets/mine` is called and the user has one `CONFIRMED` and one `PENDING` membership
- **THEN** the response contains only the `CONFIRMED` outlet

#### Scenario: User with no confirmed outlets gets an empty list
- **WHEN** `GET /outlets/mine` is called for a user with no `CONFIRMED` memberships
- **THEN** the response contains an empty list (`data: []`) with status 200

#### Scenario: Unauthenticated request is rejected
- **WHEN** `GET /outlets/mine` is called without a valid JWT
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Unified outlet list endpoint with connected filter, search, and cursor pagination
The system SHALL expose `GET /outlets` accepting query parameters `connected` (boolean), `q` (search string, optional), and `cursor` (pagination cursor, optional). The response SHALL return a paginated list of outlets and a `nextCursor` in meta.

#### Scenario: Connected outlets are returned when connected=true
- **WHEN** `GET /outlets?connected=true` is called with a valid JWT
- **THEN** the response contains only outlets where the user's `UserOutlet.status = CONFIRMED`, each with a non-null `role`

#### Scenario: Not-connected outlets are returned when connected=false
- **WHEN** `GET /outlets?connected=false` is called with a valid JWT
- **THEN** the response contains only outlets where the user's `UserOutlet.status IN (PENDING, REJECTED)`, each with `role: null` and a `membershipStatus` field

#### Scenario: Not-connected response excludes outlets with no UserOutlet row
- **WHEN** `GET /outlets?connected=false` is called
- **THEN** outlets that have no `UserOutlet` row for the user are NOT included in the response

#### Scenario: Search filters results by outlet name
- **WHEN** `GET /outlets?connected=true&q=panda` is called
- **THEN** only outlets whose name contains "panda" (case-insensitive) are returned

#### Scenario: Cursor pagination returns the next page
- **WHEN** `GET /outlets?connected=true&cursor=<nextCursor>` is called
- **THEN** the response contains the next page of results starting after the cursor

#### Scenario: Last page returns null nextCursor
- **WHEN** the final page of results is returned
- **THEN** `meta.nextCursor` is `null`

#### Scenario: Unauthenticated request is rejected
- **WHEN** `GET /outlets` is called without a valid JWT
- **THEN** the system returns `401 Unauthorized`

---

## ADDED Requirements

### Requirement: Not-connected outlet response includes membershipStatus
Each item in the `GET /outlets?connected=false` response SHALL include a `membershipStatus` field indicating whether the membership is `PENDING` or `REJECTED`. This allows the frontend to render the correct UI state without a separate request.

#### Scenario: PENDING outlet includes membershipStatus
- **WHEN** `GET /outlets?connected=false` returns an outlet with `status = PENDING`
- **THEN** the item includes `membershipStatus: "PENDING"`

#### Scenario: REJECTED outlet includes membershipStatus
- **WHEN** `GET /outlets?connected=false` returns an outlet with `status = REJECTED`
- **THEN** the item includes `membershipStatus: "REJECTED"`

#### Scenario: Connected outlet response does not include membershipStatus
- **WHEN** `GET /outlets?connected=true` returns results
- **THEN** no item includes a `membershipStatus` field (it is not applicable to confirmed memberships)
