## ADDED Requirements

### Requirement: Outlet model includes optional code and imageUrl fields
The `Outlet` TypeScript interface SHALL include two new optional fields: `code` (a string identifier such as `CU000014603`) and `imageUrl` (a URL string for the outlet's avatar/thumbnail image). Both fields are optional and nullable — existing outlets without them remain valid.

#### Scenario: Outlet with code and imageUrl is correctly typed
- **WHEN** an outlet object is constructed with `code: "CU000014603"` and `imageUrl: "https://example.com/img.jpg"`
- **THEN** TypeScript accepts the object as a valid `Outlet` without type errors

#### Scenario: Outlet without code or imageUrl is still valid
- **WHEN** an outlet object is constructed without `code` or `imageUrl` fields
- **THEN** TypeScript accepts the object as a valid `Outlet` (fields are optional)
