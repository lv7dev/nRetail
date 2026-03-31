## MODIFIED Requirements

### Requirement: Detected locale normalized to base language tag
The i18next language detector SHALL normalize any detected locale (from `navigator.language`, `localStorage`, or Zalo bootstrap) to its base BCP 47 subtag before it is applied or cached. Only values that match a registered resource key (`vi`, `en`) SHALL appear as `i18n.language`.

#### Scenario: Browser reports region-tagged Vietnamese locale
- **WHEN** `navigator.language` returns `vi-VN` and no `i18nextLng` key exists in localStorage
- **THEN** `i18n.language` SHALL equal `vi`
- **THEN** localStorage SHALL store `i18nextLng: "vi"` (not `"vi-VN"`)

#### Scenario: Browser reports region-tagged English locale
- **WHEN** `navigator.language` returns `en-US` and no `i18nextLng` key exists in localStorage
- **THEN** `i18n.language` SHALL equal `en`
- **THEN** localStorage SHALL store `i18nextLng: "en"` (not `"en-US"`)

#### Scenario: Stale region-tagged value already in localStorage
- **WHEN** localStorage contains `i18nextLng: "vi-VN"` from a previous visit
- **THEN** `i18n.language` SHALL equal `vi` after initialization
- **THEN** localStorage SHALL be updated to `i18nextLng: "vi"`

#### Scenario: Zalo bootstrap pre-seeds the language key
- **WHEN** the app loads inside the Zalo container and `zaloBootstrap` has written `i18nextLng: "en"` to localStorage before `i18n.init()` runs
- **THEN** the i18next `LanguageDetector` reads `"en"` from localStorage (highest priority source)
- **THEN** `i18n.language` SHALL equal `'en'`

## ADDED Requirements

### Requirement: Language detection priority in Zalo container
Inside the Zalo WebView on first visit (no stored preference), the detection priority SHALL be: Zalo system language → localStorage → navigator.language → fallbackLng (`vi`). This is achieved by `zaloBootstrap` seeding `localStorage['i18nextLng']` before `i18n.init()` runs, so the existing `localStorage` detector naturally picks it up.

#### Scenario: First visit inside Zalo — Zalo language wins over navigator
- **WHEN** the app loads inside Zalo with no prior stored language
- **AND** `getSystemInfo().zaloLanguage` returns `'en'`
- **AND** `navigator.language` returns `'vi-VN'`
- **THEN** `i18n.language` SHALL equal `'en'` (Zalo language, not navigator)

#### Scenario: Subsequent visits — stored user preference wins over Zalo language
- **WHEN** the user previously changed language to `'vi'` via LanguageSwitcher (stored in localStorage)
- **AND** `getSystemInfo().zaloLanguage` returns `'en'`
- **THEN** `i18n.language` SHALL equal `'vi'` (user's stored choice, not Zalo language)
