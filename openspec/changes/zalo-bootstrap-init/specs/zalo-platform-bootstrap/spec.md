## ADDED Requirements

### Requirement: Zalo language seeds i18n on first visit inside the Zalo container
When the app launches inside the Zalo WebView and no language preference has been stored by the user, `zaloBootstrap` SHALL call `getSystemInfo()` synchronously and write the normalized `zaloLanguage` value to `localStorage['i18nextLng']` before `i18n.init()` runs. If a stored preference already exists, the seed SHALL be skipped.

#### Scenario: First visit in Zalo with Vietnamese Zalo language
- **WHEN** the app loads inside the Zalo container for the first time (no `i18nextLng` in localStorage)
- **THEN** `localStorage['i18nextLng']` SHALL be set to `'vi'` before i18n initializes
- **THEN** `i18n.language` SHALL equal `'vi'` after initialization

#### Scenario: First visit in Zalo with English Zalo language
- **WHEN** the app loads inside the Zalo container for the first time and `getSystemInfo().zaloLanguage` returns `'en'` or `'en-US'`
- **THEN** `localStorage['i18nextLng']` SHALL be set to `'en'` before i18n initializes
- **THEN** `i18n.language` SHALL equal `'en'` after initialization

#### Scenario: Stored language preference is preserved
- **WHEN** `localStorage['i18nextLng']` already contains `'en'` (set by the user previously)
- **AND** `getSystemInfo().zaloLanguage` returns `'vi'`
- **THEN** `localStorage['i18nextLng']` SHALL remain `'en'` — the seed SHALL NOT overwrite it
- **THEN** `i18n.language` SHALL equal `'en'`

#### Scenario: Unsupported zaloLanguage falls back to i18next detection
- **WHEN** `getSystemInfo().zaloLanguage` returns a language code not in the supported set (`'vi'`, `'en'`)
- **THEN** `zaloBootstrap` SHALL NOT write to `localStorage['i18nextLng']`
- **THEN** i18n initialization falls back to its own detection chain and `fallbackLng: 'vi'`

### Requirement: Zalo theme seeds the theme store on first visit inside the Zalo container
When the app launches inside the Zalo WebView and no theme preference has been stored, `zaloBootstrap` SHALL write the mapped `zaloTheme` value to `localStorage['theme-preference']` before `useThemeStore`'s persist middleware rehydrates. If a stored preference already exists, the seed SHALL be skipped.

#### Scenario: First visit in Zalo with dark theme
- **WHEN** the app loads inside the Zalo container for the first time (no `theme-preference` in localStorage)
- **AND** `getSystemInfo().zaloTheme` returns `'dark'`
- **THEN** `localStorage['theme-preference']` SHALL be set to `'{"state":{"preference":"dark"}}'` (Zustand persist format) before any component renders
- **THEN** `useThemeStore.getState().preference` SHALL equal `'dark'`

#### Scenario: First visit in Zalo with light theme
- **WHEN** the app loads inside the Zalo container for the first time
- **AND** `getSystemInfo().zaloTheme` returns `'light'`
- **THEN** `useThemeStore.getState().preference` SHALL equal `'light'`

#### Scenario: Unknown zaloTheme value maps to system
- **WHEN** `getSystemInfo().zaloTheme` returns a value other than `'light'` or `'dark'`
- **THEN** `localStorage['theme-preference']` SHALL be seeded with `'system'`
- **THEN** `useThemeStore.getState().preference` SHALL equal `'system'`

#### Scenario: Stored theme preference is preserved
- **WHEN** `localStorage['theme-preference']` already contains a Zustand persist value (set by the user previously)
- **AND** `getSystemInfo().zaloTheme` returns a different value
- **THEN** `localStorage['theme-preference']` SHALL NOT be overwritten
- **THEN** `useThemeStore.getState().preference` SHALL reflect the previously stored value

### Requirement: Bootstrap is a no-op outside the Zalo container
`zaloBootstrap` SHALL perform no localStorage writes and make no `zmp-sdk` calls when running outside the Zalo WebView (browser dev, test runner).

#### Scenario: Running in browser dev environment
- **WHEN** `window.APP_ID` is `undefined` (not inside Zalo)
- **THEN** `zaloBootstrap` SHALL NOT call `getSystemInfo()`
- **THEN** `zaloBootstrap` SHALL NOT write to `localStorage`
- **THEN** i18n and theme store initialize using their existing default logic
