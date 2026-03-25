## ADDED Requirements

### Requirement: LanguageSwitcher renders a globe icon button
`LanguageSwitcher` SHALL render a button containing `<Icon name="globe" />`. The button SHALL be accessible with an aria-label.

#### Scenario: Globe icon button is rendered
- **WHEN** `<LanguageSwitcher />` is rendered
- **THEN** a button with a globe icon is present in the DOM

### Requirement: LanguageSwitcher opens a dropdown on click
When the globe button is clicked, `LanguageSwitcher` SHALL show a dropdown listing available languages. A second click SHALL close the dropdown.

#### Scenario: Dropdown opens on click
- **WHEN** the user clicks the globe button
- **THEN** a dropdown with language options is visible

#### Scenario: Dropdown closes on second click
- **WHEN** the dropdown is open and the user clicks the globe button again
- **THEN** the dropdown closes

### Requirement: LanguageSwitcher closes dropdown on outside click
When the dropdown is open and the user clicks anywhere outside the component, the dropdown SHALL close.

#### Scenario: Outside click closes the dropdown
- **WHEN** the dropdown is open and the user clicks outside the component
- **THEN** the dropdown closes

### Requirement: LanguageSwitcher shows available languages with active indicator
The dropdown SHALL list Vietnamese ("Tiếng Việt") and English ("English"). The currently active language SHALL be visually indicated (e.g., checkmark or bold).

#### Scenario: Active language is marked
- **WHEN** the current language is `vi` and the dropdown is open
- **THEN** "Tiếng Việt" has an active indicator and "English" does not

### Requirement: Selecting a language changes the app language and closes the dropdown
When the user selects a language option, `LanguageSwitcher` SHALL call `i18n.changeLanguage(code)` and close the dropdown. The selection SHALL persist via i18next's language detector (localStorage).

#### Scenario: Selecting English switches the language
- **WHEN** the user opens the dropdown and clicks "English"
- **THEN** `i18n.changeLanguage("en")` is called and the dropdown closes

#### Scenario: Language selection persists on reload
- **WHEN** the user selects "English" and reloads the page
- **THEN** the app renders in English
