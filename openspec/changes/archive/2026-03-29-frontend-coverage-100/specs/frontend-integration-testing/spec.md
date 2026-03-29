## ADDED Requirements

### Requirement: AuthProvider integration test with MSW
`src/components/AuthProvider.integration.test.tsx` SHALL exist alongside the existing auth page integration tests. It uses the real axios client intercepted by MSW and tests the full rehydration lifecycle without mocking at the service or store layer.

#### Scenario: Successful rehydration renders children with user in store
- **WHEN** an access token is in localStorage and `GET /auth/me` is handled by MSW with a valid user response
- **THEN** the auth store user is set and the children of `AuthProvider` are rendered

#### Scenario: Failed rehydration clears auth and renders children
- **WHEN** an access token is in localStorage and `GET /auth/me` returns 401
- **THEN** the auth store user is null, isReady is true, and children are rendered

#### Scenario: No token skips network call and marks ready
- **WHEN** no access token is present in localStorage
- **THEN** no GET /auth/me request is made and children render immediately with isReady true

### Requirement: register/complete integration test with MSW
`src/pages/auth/register/RegisterComplete.integration.test.tsx` SHALL exist alongside the existing register integration test. It exercises the step-3 name+password form using real axios + TanStack Query + MSW, without mocking the service layer.

#### Scenario: Successful submission stores tokens, sets auth, navigates to /
- **WHEN** valid form data is submitted with a valid otpToken in router state and MSW handles `POST /auth/register`
- **THEN** tokens appear in localStorage, the auth store has the user, and navigation proceeds to `/`

#### Scenario: Server error displays translated message
- **WHEN** MSW returns `{ code: 'PASSWORD_MISMATCH' }` on `POST /auth/register`
- **THEN** the translated error message is visible in the form

#### Scenario: Missing router state redirects without calling API
- **WHEN** the page mounts without valid router state
- **THEN** the page redirects to `/login` and no `POST /auth/register` request is made
