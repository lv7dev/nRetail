## Context

Validation error items currently carry `{ field, constraint, message }`. The `constraint` key (e.g. `minLength`) tells the frontend *which* rule failed, but not *with what value*. To render a translated message like "Phải có ít nhất 6 ký tự", the frontend needs `{ min: 6 }` — a structured params object.

class-validator's `ValidationError` does not expose constraint parameters directly. However, `getMetadataStorage()` from `class-validator` stores all decorator metadata, including the raw arguments passed to each decorator. For example, `@MinLength(6)` produces a metadata entry `{ type: 'minLength', propertyName: 'password', constraints: [6] }`. The `constraints` array contains the positional arguments.

The `exceptionFactory` in `validation.pipe.ts` already builds error items from `ValidationError[]`. The lookup is straightforward: for each error, find the matching metadata entry by `(DtoClass, propertyName, constraintKey)` and map `constraints[n]` to named keys.

## Goals / Non-Goals

**Goals:**
- Add `params?` to each validation error item so the frontend can do `t('validation.${constraint}', params)`
- Keep `exceptionFactory` clean by extracting param-lookup into a dedicated pure helper
- Cover the most common class-validator numeric constraints: `minLength`, `maxLength`, `min`, `max`, `length`, `arrayMinSize`, `arrayMaxSize`
- Omit `params` entirely when the constraint has no meaningful parameters (`isEmail`, `isNotEmpty`, `isString`, etc.)

**Non-Goals:**
- Supporting every possible class-validator constraint (long tail is covered by `params` being optional)
- Replacing the English `message` field — it stays for debuggability
- Any frontend changes — `params` is additive

## Decisions

### 1. Separate helper `extractConstraintParams`

**Decision:** Create `src/shared/pipes/extract-constraint-params.ts` that exports a single pure function:

```ts
function extractConstraintParams(
  error: ValidationError,
  constraintKey: string,
): Record<string, unknown> | undefined
```

Returns a params object or `undefined` (no params to include).

**Why over inlining in `exceptionFactory`:** The mapping logic is independently testable, and `exceptionFactory` already has one responsibility (building the error array). Mixing metadata lookup into it would make both harder to understand and test.

### 2. Constraint → params key mapping

**Decision:** Use an explicit mapping object inside the helper:

```
minLength    → { min: constraints[0] }
maxLength    → { max: constraints[0] }
min          → { min: constraints[0] }
max          → { max: constraints[0] }
length       → { min: constraints[0], max: constraints[1] }
arrayMinSize → { min: constraints[0] }
arrayMaxSize → { max: constraints[0] }
matches      → { pattern: String(constraints[0]) }
isIn         → { values: constraints[0] }
(all others) → undefined
```

**Why explicit over automatic:** Automatic key naming from positional args is ambiguous. Explicit mapping makes the contract clear and matches i18next interpolation key conventions (`{{ min }}`, `{{ max }}`).

### 3. `getMetadataStorage` lookup strategy

**Decision:** Look up metadata using `error.target?.constructor` as the DTO class reference. Filter metadata by `propertyName === error.property` and `type === constraintKey`. Take the first match.

**Why first match:** Multiple decorators of the same type on one field would be unusual; first match is always the right one.

**Edge case:** If `error.target` is undefined (can happen when `skipMissingProperties` is configured), return `undefined` — no params, no crash.

## Risks / Trade-offs

- **`getMetadataStorage` is internal API:** class-validator doesn't guarantee stability of this function between major versions. Risk is low — it has been stable across v0.13–v0.14. Mitigated by: the helper is isolated and easy to update if the API changes.
- **`constraints` array is positional:** If class-validator changes the argument order for a built-in constraint, the mapping breaks silently (wrong param value). This is extremely unlikely for stable constraints like `minLength`. Mitigated by: unit tests assert concrete values.
- **`params` omitted for unknown constraints:** Any custom or third-party constraint not in the mapping gets no `params`. This is correct — the frontend falls back to a generic translation without interpolation.
