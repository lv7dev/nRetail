## Why

On first visit, `i18next-browser-languagedetector` reads `navigator.language`, which browsers report as a full BCP 47 locale (`vi-VN`, `en-US`). The `LanguageSwitcher` compares `i18n.language` to short codes (`vi`, `en`), so no option is highlighted. The mismatch also persists: the detector caches `vi-VN` into localStorage, so the switcher stays broken on subsequent visits until the user explicitly picks a language.

## What Changes

- Add `convertDetectedLanguage` to the i18next `LanguageDetector` config in `i18n.ts` so any detected locale is normalized to its base language tag (`vi-VN` → `vi`, `en-US` → `en`) before being stored or applied.

## Capabilities

### New Capabilities

- `language-detection`: Normalization of browser-detected locales to the short codes registered in i18next resources, ensuring the active language is always a valid resource key.

### Modified Capabilities

*(none — no existing spec-level behavior changes)*

## Impact

- `miniapp/src/i18n.ts` — add `convertDetectedLanguage` option to `detection` config
- No component changes required; `LanguageSwitcher` already uses `i18n.language` which will now always be `vi` or `en`
- Users who already have `vi-VN` in localStorage will get it normalized on their next visit (detector re-caches the converted value)
