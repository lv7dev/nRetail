## Context

`resolveApiError(err, t)` in `src/utils/apiError.ts` is the single point where caught API errors are converted to display strings. It is called on every auth page via `resolveApiError(mutation.error, tErrors)`, where `tErrors` is the `t` function from `useTranslation('errors')`.

The bug: `resolveApiError` builds the i18next key as `` `errors.${err.code}` `` (e.g. `'errors.PHONE_ALREADY_EXISTS'`). i18next's default `keySeparator` is `'.'`, so this is treated as a **nested path traversal**: look for `errors.json["errors"]["PHONE_ALREADY_EXISTS"]`. The `errors.json` files are flat — `{ "PHONE_ALREADY_EXISTS": "..." }` — so the nested path doesn't exist and i18next falls back to `defaultValue: err.message` (the English backend string).

The same problem affects the `errors.unknown` fallback path: `t('errors.unknown')` looks for `errors.json["errors"]["unknown"]` and silently returns the raw key string `"errors.unknown"`.

All 6 auth pages are affected.

## Goals / Non-Goals

**Goals:**
- Backend error codes always display in the user's active language (Vietnamese by default)
- `resolveApiError` contract is clear: callers pass `useTranslation('errors').t`, the function uses flat keys directly
- All existing tests remain or are updated mechanically (no semantic changes to test logic)

**Non-Goals:**
- Adding new error codes or translations
- Changing the locale files (`errors.json`)
- Changing the i18next configuration (`keySeparator`, `nsSeparator`)
- Restructuring how namespaces are loaded

## Decisions

### Decision: Fix `resolveApiError` to drop the `errors.` prefix

**Chosen:** Change the two key-building calls:
```ts
// before
t(`errors.${err.code}`, { defaultValue: err.message })
t('errors.unknown')

// after
t(err.code as string, { defaultValue: err.message })
t('unknown')
```

Callers already pass `tErrors` from `useTranslation('errors')`, so `t('PHONE_ALREADY_EXISTS')` looks up the flat key in the `errors` namespace directly — correct.

**Alternatives considered:**
- **Restructure `errors.json` to nest keys under `"errors": { ... }`**: Works with zero code changes, but creates semantically odd `errors:errors.CODE` paths and can confuse future contributors.
- **Change i18n config `keySeparator` to `false`**: Would require changing all `errors.json` keys to literal dotted strings (e.g. `"errors.PHONE_ALREADY_EXISTS"`) and break existing dotted-key navigation elsewhere.
- **Use `t('errors:PHONE_ALREADY_EXISTS')` with colon namespace separator**: Works, but changes the key format visible in test assertions and requires callers to know the namespace separator syntax.

### Decision: Update test assertions to `'PHONE_ALREADY_EXISTS'` / `'unknown'`

The mock `t = k => k` returns the key as-is. After the fix, `resolveApiError` calls `t('PHONE_ALREADY_EXISTS')` so the mock returns `'PHONE_ALREADY_EXISTS'`. Tests that previously asserted `'errors.PHONE_ALREADY_EXISTS'` must be updated to `'PHONE_ALREADY_EXISTS'`.

This is the correct assertion — it now matches what a real i18n lookup key looks like, making tests more semantically accurate.

## Risks / Trade-offs

- **Test assertions change** → Mechanical updates only; no test logic changes. Low risk.
- **Other callers of `resolveApiError` could pass a non-`errors` `t`** → Mitigation: update `CLAUDE.md` docs to clearly state the `useTranslation('errors')` requirement. All 6 existing pages already comply.

## Open Questions

None. Root cause is confirmed, fix path is clear.
