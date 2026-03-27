## MODIFIED Requirements

### Requirement: Login flow connects to backend
The login page SHALL call `POST /auth/login` with `{ phone, password }`, store the returned tokens, and navigate to home on success.

#### Scenario: Successful login
- **WHEN** user submits valid phone and password
- **THEN** the app SHALL call `POST /auth/login`, receive `{ accessToken, refreshToken, user }`, store tokens via `storage.setTokens()` (platform-aware — `nativeStorage` in Zalo, `localStorage` in dev), set user in `useAuthStore`, and navigate to `/`

#### Scenario: Invalid credentials
- **WHEN** `POST /auth/login` returns 401 with `code: INVALID_CREDENTIALS`
- **THEN** the login form SHALL display the resolved error message and remain on the login page

#### Scenario: Submit button disabled during request
- **WHEN** the login mutation is pending (`isPending === true`)
- **THEN** the submit button SHALL show a loading spinner and be non-interactive
