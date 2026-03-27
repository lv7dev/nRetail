## ADDED Requirements

### Requirement: Token storage is platform-aware
The app SHALL use a platform-aware storage abstraction (`storage`) for reading and writing auth tokens, so that the same logic works in both Zalo Mini App (nativeStorage) and standard browser environments (localStorage fallback).

#### Scenario: Store tokens via abstraction
- **WHEN** the app receives `{ accessToken, refreshToken }` after a successful auth call
- **THEN** the app SHALL call `storage.setTokens({ accessToken, refreshToken })` rather than accessing `nativeStorage` or `localStorage` directly

#### Scenario: Retrieve tokens via abstraction
- **WHEN** the app needs to read the stored access or refresh token (e.g., for API requests or token refresh)
- **THEN** the app SHALL call `storage.getTokens()` to obtain the tokens, regardless of the underlying platform

#### Scenario: Clear tokens via abstraction
- **WHEN** the user logs out or a session is invalidated
- **THEN** the app SHALL call `storage.clearTokens()` to remove all stored auth tokens
