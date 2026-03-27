## ADDED Requirements

### Requirement: Typed success response helper
The test helper module SHALL export a `parseData<T>(res: Response): T` function that unwraps a `ResponseShape<T>` body from a supertest response and returns the `data` field typed as `T`.

#### Scenario: Parse success response data
- **WHEN** a supertest response has body `{ data: { accessToken: "...", ... } }`
- **THEN** `parseData<AuthResponse>(res)` returns `{ accessToken: "...", ... }` typed as `AuthResponse`

#### Scenario: Generic type flows through
- **WHEN** `parseData<OtpVerifyResponse>(res)` is called
- **THEN** the returned value has `otpToken` typed as `string` with full IDE autocomplete

### Requirement: Typed error response helper
The test helper module SHALL export a `parseError(res: Response): ErrorResponse` function that casts a supertest response body as `ErrorResponse`.

#### Scenario: Parse error response
- **WHEN** a supertest response has body `{ statusCode: 401, message: "...", code: "INVALID_CREDENTIALS" }`
- **THEN** `parseError(res).code` is typed as `string`

### Requirement: Helpers isolated to test/helpers/
The unsafe `as` cast SHALL appear only inside `test/helpers/response.ts` and MUST NOT be duplicated in individual test files.

#### Scenario: Test file uses helper, not raw cast
- **WHEN** `auth.integration.spec.ts` accesses response body fields
- **THEN** it calls `parseData<T>(res)` or `parseError(res)` — no direct `res.body as X` casts in the test file

### Requirement: Zero unsafe-any ESLint errors in auth integration spec
After the change, `npm run lint` SHALL report zero `no-unsafe-assignment` and `no-unsafe-member-access` errors in `test/auth/auth.integration.spec.ts`.

#### Scenario: Clean lint output
- **WHEN** `eslint test/auth/auth.integration.spec.ts` is run
- **THEN** zero errors of type `@typescript-eslint/no-unsafe-assignment` or `@typescript-eslint/no-unsafe-member-access` are reported
