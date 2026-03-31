## Requirement: User theme preference is stored and persisted
The system SHALL maintain a user theme preference of `'light'`, `'dark'`, or `'system'` in a Zustand store backed by `localStorage` persistence. The default preference SHALL be `'system'` when no persisted value exists **and the app is not running inside the Zalo container**. When running inside Zalo with no prior stored preference, the default SHALL be derived from `getSystemInfo().zaloTheme`.

### Scenario: Default preference is system (outside Zalo)
- **WHEN** the app loads for the first time with no persisted value and outside the Zalo container
- **THEN** `useThemeStore` returns `preference === 'system'`

### Scenario: Default preference follows Zalo theme on first visit inside Zalo
- **WHEN** the app loads inside the Zalo container for the first time (no `theme-preference` in localStorage)
- **AND** `getSystemInfo().zaloTheme` returns `'dark'`
- **THEN** `useThemeStore` returns `preference === 'dark'`

### Scenario: Setting preference to dark
- **WHEN** `setTheme('dark')` is called
- **THEN** `useThemeStore` returns `preference === 'dark'`

### Scenario: Setting preference to light
- **WHEN** `setTheme('light')` is called
- **THEN** `useThemeStore` returns `preference === 'light'`

### Scenario: Setting preference to system
- **WHEN** `setTheme('system')` is called after a previous explicit preference
- **THEN** `useThemeStore` returns `preference === 'system'`

### Scenario: Preference persists across sessions
- **WHEN** `setTheme('dark')` is called and the page is reloaded
- **THEN** `useThemeStore` returns `preference === 'dark'` on the new load

### Scenario: User's stored preference wins over Zalo theme on subsequent visits
- **WHEN** the user previously set theme to `'light'` (stored in localStorage)
- **AND** `getSystemInfo().zaloTheme` returns `'dark'`
- **THEN** `useThemeStore` returns `preference === 'light'`

## Requirement: Store exposes only preference, not resolved theme
The store SHALL hold only the raw user preference. Resolved theme computation (evaluating `'system'` against the OS) SHALL be the responsibility of `ThemeProvider`, not the store.

### Scenario: Store state shape
- **WHEN** `useThemeStore.getState()` is called
- **THEN** the state object contains `preference` (one of `'light' | 'dark' | 'system'`) and `setTheme` (function)
- **THEN** the state object does NOT contain a `resolved` or `isDark` field

## Requirement: Tailwind dark color tokens are defined
The system SHALL extend `tailwind.config.js` with dark-mode counterparts for surface, border, and content token groups. The following tokens SHALL be defined:
- `surface.dark` — primary background in dark mode
- `surface.dark-muted` — muted background in dark mode
- `surface.dark-overlay` — overlay/elevated background in dark mode
- `border.dark` — default border color in dark mode
- `border.dark-strong` — strong border color in dark mode
- `content.dark` — default text color in dark mode
- `content.dark-muted` — muted text color in dark mode
- `content.dark-subtle` — subtle text color in dark mode

### Scenario: Dark tokens are available as Tailwind utilities
- **WHEN** a component applies `dark:bg-surface-dark` and the `dark` class is on `<html>`
- **THEN** the Tailwind-generated CSS applies the `surface.dark` background color

### Scenario: Primary, destructive, and success tokens have no dark variants
- **WHEN** inspecting `tailwind.config.js`
- **THEN** `primary`, `destructive`, and `success` token groups contain no `.dark` sub-keys
