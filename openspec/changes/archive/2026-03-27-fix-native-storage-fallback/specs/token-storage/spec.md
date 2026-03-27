## ADDED Requirements

### Requirement: Token storage is platform-aware
The `storage` utility SHALL use `nativeStorage` when running inside the Zalo container and `localStorage` otherwise. Callers SHALL never need to check the environment themselves.

#### Scenario: Running inside Zalo
- **WHEN** `window.APP_ID` is set (Zalo container is active)
- **THEN** `storage.getAccessToken()`, `storage.setTokens()`, and `storage.clearTokens()` SHALL delegate to `nativeStorage` from `zmp-sdk`

#### Scenario: Running in browser dev or test environment
- **WHEN** `window.APP_ID` is undefined (outside Zalo container)
- **THEN** `storage.getAccessToken()`, `storage.setTokens()`, and `storage.clearTokens()` SHALL delegate to `localStorage`

#### Scenario: Uniform API surface
- **WHEN** any module calls `storage.*`
- **THEN** it SHALL receive the correct value regardless of environment, with no try-catch or environment branching at the call site
