## ADDED Requirements

### Requirement: Unified outlet list endpoint with connected filter, search, and cursor pagination
The system SHALL expose `GET /outlets` accepting query parameters `connected` (boolean), `q` (search string, optional), and `cursor` (pagination cursor, optional). The response SHALL return a paginated list of outlets and a `nextCursor` in meta.

#### Scenario: Connected outlets are returned when connected=true
- **WHEN** `GET /outlets?connected=true` is called with a valid JWT
- **THEN** the response contains only outlets the authenticated user is a member of, each with a non-null `role`

#### Scenario: Not-connected outlets are returned when connected=false
- **WHEN** `GET /outlets?connected=false` is called with a valid JWT
- **THEN** the response contains outlets in the system the user has NOT joined, each with `role: null`

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

### Requirement: Outlet API response includes code and imageUrl fields
Each outlet item in `GET /outlets` responses SHALL include the `code` and `imageUrl` fields in addition to `id`, `name`, `address`, and `role`.

#### Scenario: Response shape includes new fields
- **WHEN** `GET /outlets?connected=true` returns results
- **THEN** each item includes `code` (string or null) and `imageUrl` (string or null)
