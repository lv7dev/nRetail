# Language Detection Spec

## Requirement: Detected locale normalized to base language tag
The i18next language detector SHALL normalize any detected locale (from `navigator.language` or `localStorage`) to its base BCP 47 subtag before it is applied or cached. Only values that match a registered resource key (`vi`, `en`) SHALL appear as `i18n.language`.

### Scenario: Browser reports region-tagged Vietnamese locale
- **WHEN** `navigator.language` returns `vi-VN` and no `i18nextLng` key exists in localStorage
- **THEN** `i18n.language` SHALL equal `vi`
- **THEN** localStorage SHALL store `i18nextLng: "vi"` (not `"vi-VN"`)

### Scenario: Browser reports region-tagged English locale
- **WHEN** `navigator.language` returns `en-US` and no `i18nextLng` key exists in localStorage
- **THEN** `i18n.language` SHALL equal `en`
- **THEN** localStorage SHALL store `i18nextLng: "en"` (not `"en-US"`)

### Scenario: Stale region-tagged value already in localStorage
- **WHEN** localStorage contains `i18nextLng: "vi-VN"` from a previous visit
- **THEN** `i18n.language` SHALL equal `vi` after initialization
- **THEN** localStorage SHALL be updated to `i18nextLng: "vi"`

## Requirement: LanguageSwitcher highlights active language on first visit
The LanguageSwitcher component SHALL render the active language option as highlighted (using the `text-primary font-medium` classes) immediately on first visit, before the user has interacted with it.

### Scenario: First visit with Vietnamese browser locale
- **WHEN** the user opens the app for the first time with a Vietnamese browser locale
- **THEN** the LanguageSwitcher SHALL highlight "Tiếng Việt" as the active option when opened

### Scenario: First visit with English browser locale
- **WHEN** the user opens the app for the first time with an English browser locale
- **THEN** the LanguageSwitcher SHALL highlight "English" as the active option when opened
