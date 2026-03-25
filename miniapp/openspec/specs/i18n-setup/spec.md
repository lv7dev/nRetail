## ADDED Requirements

### Requirement: react-i18next is configured at app root
The app SHALL initialize `react-i18next` in `src/i18n.ts` and import it in `src/app.tsx` before any component renders. The configuration SHALL include language detection (localStorage → navigator → fallback `vi`) and two namespaces: `auth` and `common`.

#### Scenario: Default language is Vietnamese
- **WHEN** no language is stored in localStorage and navigator language is unknown
- **THEN** the app renders in Vietnamese (`vi`)

#### Scenario: Persisted language is restored
- **WHEN** localStorage contains `i18nextLng = "en"`
- **THEN** the app renders in English on next load

### Requirement: Locale files cover all user-visible strings
The app SHALL provide translation files at `src/locales/vi/auth.json`, `src/locales/vi/common.json`, `src/locales/en/auth.json`, and `src/locales/en/common.json`. Every string displayed to users in auth pages and shared UI SHALL have an entry in both locale files.

#### Scenario: Missing key falls back gracefully
- **WHEN** a translation key is missing in the active locale
- **THEN** i18next renders the key string rather than crashing

#### Scenario: Both locale files have matching keys
- **WHEN** a key exists in `vi/auth.json`
- **THEN** the same key exists in `en/auth.json`

### Requirement: Language change updates all rendered strings immediately
Calling `i18n.changeLanguage(lang)` SHALL update all components using `useTranslation` without a page reload.

#### Scenario: Language switch re-renders strings
- **WHEN** user switches from `vi` to `en`
- **THEN** all visible strings update to English immediately
