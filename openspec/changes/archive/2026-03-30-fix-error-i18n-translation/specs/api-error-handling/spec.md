## MODIFIED Requirements

### Requirement: `resolveApiError(err, t)` utility for centralized error display
The app SHALL export a `resolveApiError(err: unknown, t: TFunction): string` utility from `src/utils/apiError.ts`. Pages use this to get a display-ready string from any caught error. The `t` parameter MUST be the translation function from `useTranslation('errors')`.

#### Scenario: Known error code resolves to i18n message
- **WHEN** `err` is an `ApiError` with `code: 'PHONE_ALREADY_EXISTS'`
- **THEN** `resolveApiError` SHALL call `t('PHONE_ALREADY_EXISTS')` (not `t('errors.PHONE_ALREADY_EXISTS')`) and return the result

#### Scenario: Backend error code displays in the user's active language
- **WHEN** the app language is Vietnamese and `err` is an `ApiError` with a known `code`
- **THEN** `resolveApiError` SHALL return the Vietnamese string from `vi/errors.json` for that code (not the English backend message)

#### Scenario: Unknown error code falls back to backend message
- **WHEN** `err` is an `ApiError` with a `code` not present in `errors.json`
- **THEN** `resolveApiError` SHALL return `err.message` (the backend's English message as fallback, via `defaultValue`)

#### Scenario: Non-ApiError falls back to generic message
- **WHEN** `err` is a network error or unexpected thrown value (not `instanceof ApiError`)
- **THEN** `resolveApiError` SHALL call `t('unknown')` and return the result
