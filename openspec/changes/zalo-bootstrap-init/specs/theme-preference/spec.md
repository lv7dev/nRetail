## MODIFIED Requirements

### Requirement: User theme preference is stored and persisted
The system SHALL maintain a user theme preference of `'light'`, `'dark'`, or `'system'` in a Zustand store backed by `localStorage` persistence. The default preference SHALL be `'system'` when no persisted value exists **and the app is not running inside the Zalo container**. When running inside Zalo with no prior stored preference, the default SHALL be derived from `getSystemInfo().zaloTheme`.

#### Scenario: Default preference is system (outside Zalo)
- **WHEN** the app loads for the first time with no persisted value and outside the Zalo container
- **THEN** `useThemeStore` returns `preference === 'system'`

#### Scenario: Default preference follows Zalo theme on first visit inside Zalo
- **WHEN** the app loads inside the Zalo container for the first time (no `theme-preference` in localStorage)
- **AND** `getSystemInfo().zaloTheme` returns `'dark'`
- **THEN** `useThemeStore` returns `preference === 'dark'`

#### Scenario: Setting preference to dark
- **WHEN** `setTheme('dark')` is called
- **THEN** `useThemeStore` returns `preference === 'dark'`

#### Scenario: Setting preference to light
- **WHEN** `setTheme('light')` is called
- **THEN** `useThemeStore` returns `preference === 'light'`

#### Scenario: Setting preference to system
- **WHEN** `setTheme('system')` is called after a previous explicit preference
- **THEN** `useThemeStore` returns `preference === 'system'`

#### Scenario: Preference persists across sessions
- **WHEN** `setTheme('dark')` is called and the page is reloaded
- **THEN** `useThemeStore` returns `preference === 'dark'` on the new load

#### Scenario: User's stored preference wins over Zalo theme on subsequent visits
- **WHEN** the user previously set theme to `'light'` (stored in localStorage)
- **AND** `getSystemInfo().zaloTheme` returns `'dark'`
- **THEN** `useThemeStore` returns `preference === 'light'`
