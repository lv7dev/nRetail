## ADDED Requirements

### Requirement: ThemeSwitcher renders a dropdown with three theme options
The `ThemeSwitcher` component SHALL render a button that opens a dropdown containing exactly three options: Light (`'light'`), System (`'system'`), and Dark (`'dark'`). Each option SHALL display an icon and a localized label. The component SHALL follow the same structural pattern as `LanguageSwitcher` (relative container, button trigger, absolutely positioned dropdown).

#### Scenario: Dropdown is closed by default
- **WHEN** `ThemeSwitcher` is rendered
- **THEN** the three options are not visible

#### Scenario: Clicking the trigger opens the dropdown
- **WHEN** the trigger button is clicked
- **THEN** all three options become visible: Light, System, Dark

#### Scenario: Clicking an option closes the dropdown
- **WHEN** the dropdown is open and an option is clicked
- **THEN** the dropdown closes

#### Scenario: Clicking outside closes the dropdown
- **WHEN** the dropdown is open and a mousedown event fires outside the component
- **THEN** the dropdown closes

### Requirement: ThemeSwitcher calls setTheme on option selection
The component SHALL call `useThemeStore.setTheme` with the selected preference value when an option is clicked.

#### Scenario: Selecting Dark calls setTheme with 'dark'
- **WHEN** the dropdown is open and the Dark option is clicked
- **THEN** `useThemeStore.setTheme` is called with `'dark'`

#### Scenario: Selecting System calls setTheme with 'system'
- **WHEN** the dropdown is open and the System option is clicked
- **THEN** `useThemeStore.setTheme` is called with `'system'`

#### Scenario: Selecting Light calls setTheme with 'light'
- **WHEN** the dropdown is open and the Light option is clicked
- **THEN** `useThemeStore.setTheme` is called with `'light'`

### Requirement: ThemeSwitcher highlights the active preference
The component SHALL visually distinguish the currently active preference option. The active option SHALL use `text-primary font-medium` styling. Inactive options SHALL use `text-content` styling. The active state SHALL reflect the raw `preference` from the store (not the resolved theme).

#### Scenario: Active option is highlighted
- **WHEN** `useThemeStore.preference` is `'dark'` and the dropdown is open
- **THEN** the Dark option has `text-primary font-medium` classes
- **THEN** the Light and System options have `text-content` classes

#### Scenario: System option is highlighted when preference is system
- **WHEN** `useThemeStore.preference` is `'system'` and the dropdown is open
- **THEN** the System option has `text-primary font-medium` classes

### Requirement: ThemeSwitcher is placed in all three app contexts
The component SHALL be rendered in:
1. `AuthLayout` — next to the existing `LanguageSwitcher` in the top-right floating area.
2. `AppLayout` — in a new flex header row added at the top of the layout, containing both `ThemeSwitcher` and `LanguageSwitcher`.
3. The Profile page — as a settings row that labels the section "Theme" and renders the `ThemeSwitcher` inline.

#### Scenario: ThemeSwitcher present in AuthLayout
- **WHEN** any auth page is rendered
- **THEN** `ThemeSwitcher` is visible alongside `LanguageSwitcher` in the top-right area

#### Scenario: ThemeSwitcher present in AppLayout header
- **WHEN** any authenticated app page is rendered
- **THEN** `AppLayout` renders a header row containing `ThemeSwitcher` and `LanguageSwitcher`

#### Scenario: ThemeSwitcher present on Profile page
- **WHEN** the Profile page is rendered
- **THEN** a theme settings row containing `ThemeSwitcher` is visible
