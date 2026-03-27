## ADDED Requirements

### Requirement: ApiError class carries status, message, and code
All HTTP errors from the Axios instance SHALL be represented as `ApiError` instances with three fields: `status` (HTTP status code), `message` (human-readable string), and `code` (machine-readable backend error code, optional).

#### Scenario: Backend returns structured error with code
- **WHEN** the server responds with `{ statusCode, message, code }` in the error body
- **THEN** `ApiError.code` SHALL be set to the backend `code` value

#### Scenario: Caller distinguishes HTTP errors from network errors
- **WHEN** a hook or utility catches an error from the Axios instance
- **THEN** `err instanceof ApiError` SHALL be `true` for HTTP errors and `false` for network/timeout errors

---

### Requirement: `resolveApiError(err, t)` utility for centralized error display
The app SHALL export a `resolveApiError(err: unknown, t: TFunction): string` utility from `src/utils/apiError.ts`. Pages use this to get a display-ready string from any caught error.

#### Scenario: Known error code resolves to i18n message
- **WHEN** `err` is an `ApiError` with `code: 'PHONE_ALREADY_EXISTS'`
- **THEN** `resolveApiError` SHALL return `t('errors.PHONE_ALREADY_EXISTS')`

#### Scenario: Unknown error code falls back to backend message
- **WHEN** `err` is an `ApiError` with a `code` not present in `errors.json`
- **THEN** `resolveApiError` SHALL return `err.message` (the backend's English message as fallback)

#### Scenario: Non-ApiError falls back to generic message
- **WHEN** `err` is a network error or unexpected thrown value (not `instanceof ApiError`)
- **THEN** `resolveApiError` SHALL return `t('errors.unknown')`

---

### Requirement: `errors.json` i18n catalog maps backend codes to user-facing messages
The app SHALL maintain `src/locales/en/errors.json` and `src/locales/vi/errors.json` with entries for every backend error code used by auth flows. New error codes require only adding a key to these files — no code changes.

#### Scenario: All auth error codes are present
- **WHEN** `errors.json` is loaded
- **THEN** it SHALL contain keys for: `PHONE_ALREADY_EXISTS`, `PHONE_NOT_FOUND`, `OTP_INVALID`, `OTP_EXPIRED`, `OTP_PURPOSE_MISMATCH`, `INVALID_CREDENTIALS`, `PASSWORD_MISMATCH`, `REFRESH_TOKEN_INVALID`, `RATE_LIMIT_EXCEEDED`, `unknown`

#### Scenario: New error code added to backend
- **WHEN** the backend introduces a new error code
- **THEN** adding the key to `errors.json` SHALL make it display correctly with no other code changes
