## ADDED Requirements

### Requirement: App shows SplashPage until auth state is ready
On every app start, the app SHALL not render the route tree until auth state has been resolved. A `SplashPage` (centered logo + spinner) SHALL be shown in the interim.

#### Scenario: App starts with no stored token
- **WHEN** `nativeStorage.getItem('accessToken')` returns null or empty on mount
- **THEN** `isReady` SHALL be set to `true` immediately and the route tree SHALL render (React Router handles redirect to `/login`)

#### Scenario: App starts with a stored token
- **WHEN** `nativeStorage.getItem('accessToken')` returns a non-empty token
- **THEN** the app SHALL call `GET /auth/me` before rendering routes

#### Scenario: SplashPage shown during rehydration
- **WHEN** `isReady` is `false`
- **THEN** `AuthProvider` SHALL render `<SplashPage />` instead of the route tree

#### Scenario: Routes render after rehydration
- **WHEN** `isReady` becomes `true`
- **THEN** `AuthProvider` SHALL render the route tree and the user lands on the URL they were at

---

### Requirement: AuthProvider rehydrates user from stored token
`AuthProvider` SHALL call `GET /auth/me` once on mount when a stored access token is found, then set the user in `useAuthStore`.

#### Scenario: GET /auth/me succeeds
- **WHEN** the stored token is valid and `GET /auth/me` returns a user
- **THEN** `setAuth(user)` SHALL be called and `isReady` set to `true`

#### Scenario: GET /auth/me returns 401 (expired token)
- **WHEN** the stored token is expired and `GET /auth/me` returns 401
- **THEN** `clearAuth()` SHALL be called and `isReady` set to `true` (user is redirected to `/login` by `ProtectedRoute`)

#### Scenario: GET /auth/me fails (network error)
- **WHEN** the network is unavailable during rehydration
- **THEN** `clearAuth()` SHALL be called and `isReady` set to `true` (fail safe — don't leave app stuck on splash)

---

### Requirement: Tokens persisted in nativeStorage across sessions
Access and refresh tokens SHALL be stored in `nativeStorage` (Zalo native storage in production, localStorage fallback in dev) so that sessions survive page reloads and app restarts.

#### Scenario: Tokens written on login/register
- **WHEN** `setAuth(user, accessToken, refreshToken)` is called
- **THEN** both tokens SHALL be written to `nativeStorage` under keys `accessToken` and `refreshToken`

#### Scenario: Tokens cleared on logout or auth failure
- **WHEN** `clearAuth()` is called
- **THEN** both token keys SHALL be removed from `nativeStorage` and `user` in `useAuthStore` set to `null`

#### Scenario: Tokens survive page reload
- **WHEN** the user reloads the page while logged in
- **THEN** tokens SHALL still be present in `nativeStorage` and `AuthProvider` SHALL rehydrate the session
