## Context

The miniapp uses `i18next` with `i18next-browser-languagedetector`. On first visit (no cached preference), the detector falls back to `navigator.language`, which returns BCP 47 locale tags like `vi-VN` or `en-US`. The i18next `resources` object only registers short codes (`vi`, `en`). When `i18n.language` is `vi-VN`, the `LanguageSwitcher` strict-equality check (`i18n.language === lang.code`) fails for all options, so no item appears active. The detector also writes the raw `vi-VN` value into `localStorage` as `i18nextLng`, so the broken state persists on repeat visits until the user explicitly clicks an option.

## Goals / Non-Goals

**Goals:**
- Ensure `i18n.language` is always a registered short code (`vi`, `en`) regardless of what the browser or localStorage reports
- Fix the LanguageSwitcher active-item highlight on first visit with no extra component changes
- Clean up stale `vi-VN` values from existing localStorage on next visit (detector re-caches after normalization)

**Non-Goals:**
- Supporting region-specific locales (e.g., separate `vi-VN` vs `vi-HN` translations) — not planned
- Changing the `LANGUAGES` array in `LanguageSwitcher` or its comparison logic
- Any backend changes

## Decisions

### Use `convertDetectedLanguage` in the detector config

`i18next-browser-languagedetector` provides a `convertDetectedLanguage` hook that transforms the raw detected locale before it is applied or cached. Applying `(lng) => lng.split('-')[0]` normalizes any BCP 47 tag to its base subtag.

**Alternatives considered:**

| Alternative | Why rejected |
|---|---|
| Compare `i18n.resolvedLanguage` in LanguageSwitcher | Fixes active-state display but leaves `vi-VN` in localStorage; future readers of the cache still get the wrong value |
| Normalize in the comparison (`i18n.language.split('-')[0]`) | Same problem as above — symptoms hidden, root cause stays |
| Add `vi-VN` / `en-US` to LANGUAGES array | Misleading — we don't have region-specific translations |
| Set `lng: 'vi'` explicitly and remove LanguageDetector | Would hard-code the language and lose browser-preference detection entirely |

The `convertDetectedLanguage` approach is the root fix: normalization happens once at the seam between the detector and i18next core, so all downstream code (component comparisons, localStorage cache) sees only valid short codes.

## Risks / Trade-offs

- **Only base tag is retained** → If a future team member adds `vi-HN` as a separate resource key, `convertDetectedLanguage` would silently collapse it to `vi`. Mitigation: the function is a one-liner in `i18n.ts` and easy to revisit; the non-goal is documented here.
- **Existing stale `vi-VN` in localStorage** → On next visit the detector reads `vi-VN`, passes it through `convertDetectedLanguage`, gets `vi`, and writes `vi` back. No manual migration needed.
- **No test coverage for `i18n.ts`** — it is excluded from Vitest coverage (`src/i18n.ts` in exclusions list). The fix is verified via the `LanguageSwitcher` component test, which can mock `i18n.language` to `vi-VN` and assert the active state.
