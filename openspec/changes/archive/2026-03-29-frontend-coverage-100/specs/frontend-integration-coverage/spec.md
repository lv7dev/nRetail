## ADDED Requirements

### Requirement: AuthProvider integration test with MSW
`src/components/AuthProvider.integration.test.tsx` SHALL test rehydration flows using the real axios client intercepted by MSW, without mocking `authService` or the auth store.

#### Scenario: Token present, getMe succeeds — children rendered
- **WHEN** a valid access token is in localStorage and MSW handles `GET /auth/me` with a user response
- **THEN** `AuthProvider` renders its children after the getMe call resolves and the auth store has the user set

#### Scenario: Token present, getMe returns 401 — auth cleared, children rendered
- **WHEN** a valid access token is in localStorage and MSW returns 401 on `GET /auth/me`
- **THEN** `AuthProvider` clears auth (user = null, isReady = true) and renders its children

#### Scenario: No token — children rendered immediately without network call
- **WHEN** no access token is in localStorage
- **THEN** `GET /auth/me` is NOT called and children are rendered with isReady = true

### Requirement: register/complete integration test with MSW
`src/pages/auth/register/RegisterComplete.integration.test.tsx` SHALL test the form submission flow using the real axios client and TanStack Query without mocking at the service layer.

#### Scenario: Successful registration stores tokens, sets auth, navigates to /
- **WHEN** valid name, password, and confirm-password are submitted with a valid otpToken in router state and MSW handles `POST /auth/register` with an auth response
- **THEN** tokens are stored in localStorage, the auth store user is set, and the router navigates to `/`

#### Scenario: API error displays translated error message
- **WHEN** MSW returns an error response (e.g. `{ code: 'PASSWORD_MISMATCH' }`) on `POST /auth/register`
- **THEN** the resolved error message for `PASSWORD_MISMATCH` is displayed in the alert component

#### Scenario: Redirect guard — missing router state skips network call
- **WHEN** `RegisterCompletePage` mounts with no `otpToken` in router state
- **THEN** the page immediately redirects to `/login` and `POST /auth/register` is never called
