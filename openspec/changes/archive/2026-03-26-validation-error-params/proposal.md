## Why

Validation error responses include a `constraint` key (e.g. `minLength`) but no structured parameters, so the frontend cannot render translated messages that include the actual rule value (e.g. "Phải có ít nhất 6 ký tự"). Adding a `params` object makes the API fully self-describing — the frontend never needs to hardcode rule values and the BE and FE can evolve independently.

## What Changes

- Add an optional `params` field to each validation error item: `{ field, constraint, params?, message }`
- Extract `params` from class-validator's metadata storage via a new pure helper `extractConstraintParams(error, constraintKey)` — kept separate from `exceptionFactory` for testability
- The `params` object keys follow i18next interpolation conventions (e.g. `{ min: 6 }`, `{ max: 255 }`) so the frontend can directly call `t('validation.minLength', params)`
- `params` is omitted when the constraint has no meaningful parameters (e.g. `isEmail`, `isNotEmpty`)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `api-error-responses`: Validation error items gain an optional `params` field containing structured constraint parameters

## Impact

- **Backend**: `src/shared/pipes/validation.pipe.ts` (update `exceptionFactory`), new `src/shared/pipes/extract-constraint-params.ts` helper
- **Tests**: new `src/shared/pipes/__tests__/extract-constraint-params.spec.ts`, update `validation.pipe.spec.ts` to assert `params`
- **Frontend**: no breaking change — `params` is additive; FE can now pass `params` to `t()` for interpolated translations
- **No breaking changes** — `field`, `constraint`, and `message` fields are preserved
