## Requirements

### Requirement: Active refresh tokens per user are capped at 5
The system SHALL allow a maximum of 5 non-expired refresh tokens per user at any time. When `issueTokens` is called and the user already has 5 or more non-expired tokens, the system SHALL delete the oldest (earliest `expiresAt`) before creating the new one. This supports up to 5 concurrent device sessions per user.

#### Scenario: Token issued within cap
- **WHEN** a user has fewer than 5 active refresh tokens and logs in
- **THEN** a new token is created without evicting any existing token

#### Scenario: Oldest token evicted when cap is reached
- **WHEN** a user already has 5 active refresh tokens and logs in again
- **THEN** the token with the earliest `expiresAt` is deleted and a new token is created
- **THEN** the total active token count remains 5

#### Scenario: Evicted device session is invalidated
- **WHEN** a device's refresh token is evicted due to cap overflow
- **THEN** the next `POST /auth/refresh` call from that device returns `401 Unauthorized` with `code: "REFRESH_TOKEN_INVALID"`

### Requirement: Expired tokens are cleaned up lazily on login
The system SHALL delete all expired refresh tokens for a user before applying the cap check during `issueTokens`. This prevents expired tokens from counting toward the cap and consuming an eviction slot.

#### Scenario: Expired tokens do not count toward the cap
- **WHEN** a user has 5 tokens but all 5 are expired, and the user logs in
- **THEN** all 5 expired tokens are deleted before the cap check
- **THEN** a new token is created without evicting any unexpired token

#### Scenario: Mixed expired and active tokens — only expired are cleaned
- **WHEN** a user has 3 active and 2 expired tokens, and the user logs in
- **THEN** the 2 expired tokens are deleted, leaving 3 active
- **THEN** a new token is created (total: 4 active), within the cap

### Requirement: Refresh token lookup uses tokenPrefix for O(1) performance
The system SHALL store a `tokenPrefix` (first 8 hex characters of the raw random token) alongside the bcrypt hash in `RefreshToken`. `findAndDelete` SHALL query `WHERE tokenPrefix = :prefix AND expiresAt > now()` to retrieve at most one candidate row, then bcrypt-compare only that row. This replaces the previous full table scan.

#### Scenario: Refresh token found and deleted via prefix lookup
- **WHEN** `POST /auth/refresh` is called with a valid refresh token
- **THEN** the system locates the token by `tokenPrefix` without scanning unrelated rows
- **THEN** the token is deleted and a new `TokenPair` is returned

#### Scenario: Refresh token not found returns 401
- **WHEN** `POST /auth/refresh` is called with an unknown or expired token
- **THEN** the system returns `401 Unauthorized` with `code: "REFRESH_TOKEN_INVALID"`

#### Scenario: Prefix collision is handled gracefully
- **WHEN** two tokens for the same user share the same `tokenPrefix` (extremely rare)
- **THEN** the system bcrypt-compares both candidates and matches the correct one
- **THEN** only the matching token is deleted; the other remains active
