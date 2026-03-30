## Requirement: ThemeProvider resolves the effective theme from preference and OS signal
`ThemeProvider` SHALL compute a resolved theme (`'light'` or `'dark'`) from the stored preference. When preference is `'light'` or `'dark'`, the resolved theme SHALL equal the preference directly. When preference is `'system'`, the resolved theme SHALL equal the result of `window.matchMedia('(prefers-color-scheme: dark)').matches` evaluated at render time.

### Scenario: Resolved theme is dark when preference is dark
- **WHEN** `preference` is `'dark'`
- **THEN** resolved theme is `'dark'` regardless of OS setting

### Scenario: Resolved theme is light when preference is light
- **WHEN** `preference` is `'light'`
- **THEN** resolved theme is `'light'` regardless of OS setting

### Scenario: Resolved theme follows OS when preference is system and OS is dark
- **WHEN** `preference` is `'system'` and `prefers-color-scheme` is `dark`
- **THEN** resolved theme is `'dark'`

### Scenario: Resolved theme follows OS when preference is system and OS is light
- **WHEN** `preference` is `'system'` and `prefers-color-scheme` is `light`
- **THEN** resolved theme is `'light'`

## Requirement: ThemeProvider synchronizes the `dark` class on `<html>`
`ThemeProvider` SHALL add the `dark` class to `document.documentElement` when the resolved theme is `'dark'`, and remove it when the resolved theme is `'light'`. This enables all Tailwind `dark:` utilities throughout the component tree.

### Scenario: html element gets dark class when resolved is dark
- **WHEN** the resolved theme is `'dark'`
- **THEN** `document.documentElement.classList` contains `'dark'`

### Scenario: html element loses dark class when resolved is light
- **WHEN** the resolved theme transitions from `'dark'` to `'light'`
- **THEN** `document.documentElement.classList` does NOT contain `'dark'`

## Requirement: ThemeProvider synchronizes `zaui-theme` attribute on `<body>`
`ThemeProvider` SHALL set `document.body.setAttribute('zaui-theme', resolved)` on every resolved-theme change. This enables `zmp-ui` dark styles. The attribute SHALL be set to `'dark'` or `'light'` (never `'system'`).

### Scenario: body gets zaui-theme dark when resolved is dark
- **WHEN** the resolved theme is `'dark'`
- **THEN** `document.body.getAttribute('zaui-theme')` is `'dark'`

### Scenario: body gets zaui-theme light when resolved is light
- **WHEN** the resolved theme is `'light'`
- **THEN** `document.body.getAttribute('zaui-theme')` is `'light'`

### Scenario: zaui-theme is never set to system
- **WHEN** preference is `'system'` and OS is dark
- **THEN** `document.body.getAttribute('zaui-theme')` is `'dark'`, NOT `'system'`

## Requirement: ThemeProvider tracks OS preference changes when preference is system
When the user's preference is `'system'`, `ThemeProvider` SHALL add an event listener to `window.matchMedia('(prefers-color-scheme: dark)')` for the `'change'` event. When the OS preference changes, the resolved theme SHALL update and DOM sync SHALL re-execute. When the preference changes away from `'system'`, or when `ThemeProvider` unmounts, the listener SHALL be removed.

### Scenario: DOM updates when OS changes to dark while preference is system
- **WHEN** `preference` is `'system'` and the OS fires a `prefers-color-scheme: dark` change event
- **THEN** `document.documentElement.classList` contains `'dark'`
- **THEN** `document.body.getAttribute('zaui-theme')` is `'dark'`

### Scenario: DOM updates when OS changes to light while preference is system
- **WHEN** `preference` is `'system'` and the OS fires a `prefers-color-scheme: light` change event
- **THEN** `document.documentElement.classList` does NOT contain `'dark'`
- **THEN** `document.body.getAttribute('zaui-theme')` is `'light'`

### Scenario: Listener is removed when preference changes from system
- **WHEN** `preference` changes from `'system'` to `'dark'`
- **THEN** the `change` event listener on the matchMedia object is removed (cleanup runs)

### Scenario: Listener is removed on unmount
- **WHEN** `ThemeProvider` unmounts
- **THEN** any active `change` event listener on the matchMedia object is removed

## Requirement: ThemeProvider wraps the app without rendering visible UI
`ThemeProvider` SHALL render its `children` directly without adding any DOM elements. It is a pure effect provider — it produces no markup of its own.

### Scenario: ThemeProvider passes children through
- **WHEN** `ThemeProvider` renders with child content
- **THEN** the child content is visible in the DOM
- **THEN** no extra wrapping element is added by `ThemeProvider`
