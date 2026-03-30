## ADDED Requirements

### Requirement: UI components respond to dark mode via Tailwind dark: variants
All UI primitive components (Button, Input, PasswordInput, OtpInput, Checkbox) SHALL render using dark surface, content, and border tokens when the `dark` class is present on `<html>`.

#### Scenario: Button secondary variant in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** a `secondary` Button SHALL display with `dark:bg-surface-dark-muted` background, `dark:text-content-dark` text color, and `dark:border-border-dark` border

#### Scenario: Button ghost variant in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** a `ghost` Button SHALL display with `dark:hover:bg-surface-dark-muted` hover background and `dark:text-content-dark` text color

#### Scenario: Input field in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** an Input field SHALL display with `dark:bg-surface-dark` background, `dark:text-content-dark` input text, `dark:border-border-dark` default border, and `dark:placeholder:text-content-dark-subtle` placeholder text
- **THEN** the Input label SHALL display with `dark:text-content-dark`

#### Scenario: PasswordInput field in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** a PasswordInput field SHALL display with `dark:bg-surface-dark` background, `dark:text-content-dark` text, `dark:border-border-dark` border, `dark:placeholder:text-content-dark-subtle` placeholder, and `dark:text-content-dark-muted` toggle icon

#### Scenario: OtpInput cells in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** each OTP digit cell SHALL display with `dark:bg-surface-dark` background, `dark:border-border-dark` border, and `dark:text-content-dark` text

#### Scenario: Checkbox label in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** the Checkbox label text SHALL display with `dark:text-content-dark`
- **THEN** the Checkbox border SHALL use `dark:border-border-dark`

### Requirement: Shared components respond to dark mode
Shared components (BottomNav, LanguageSwitcher) SHALL respond to the `dark` class on `<html>` by switching to dark surface, border, and content tokens.

#### Scenario: BottomNav in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** the BottomNav container SHALL display with `dark:bg-surface-dark` background and `dark:border-border-dark` top border

#### Scenario: LanguageSwitcher button in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** the LanguageSwitcher trigger button SHALL display with `dark:text-content-dark-muted` default text, `dark:hover:text-content-dark` hover text, and `dark:hover:bg-surface-dark-muted` hover background

#### Scenario: LanguageSwitcher dropdown in dark mode
- **WHEN** the `dark` class is on `<html>` AND the LanguageSwitcher dropdown is open
- **THEN** the dropdown panel SHALL display with `dark:bg-surface-dark` background and `dark:border-border-dark` border
- **THEN** non-active language options SHALL display with `dark:text-content-dark`
- **THEN** option hover state SHALL use `dark:hover:bg-surface-dark-muted`

### Requirement: Layout components respond to dark mode
Layout wrapper components (AuthLayout) SHALL switch to dark surface colors when the `dark` class is present on `<html>`.

#### Scenario: AuthLayout background in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** the AuthLayout root container SHALL display with `dark:bg-surface-dark` background

### Requirement: Auth pages respond to dark mode
All auth flow pages (Login, Register, RegisterComplete, Otp, ForgotPassword, NewPassword) SHALL render heading and body text using dark content tokens when the `dark` class is present on `<html>`.

#### Scenario: Auth page heading in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** all `<h1>` headings on auth pages SHALL display with `dark:text-content-dark`

#### Scenario: Auth page descriptive text in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** all descriptive/muted paragraph text on auth pages SHALL display with `dark:text-content-dark-muted`

### Requirement: section-container CSS class responds to dark mode
The `.section-container` utility class defined in `app.css` SHALL use a dark background color when the `dark` class is on `<html>`, instead of the hardcoded `#ffffff`.

#### Scenario: section-container background in dark mode
- **WHEN** the `dark` class is on `<html>` AND an element has the `section-container` class
- **THEN** the element background SHALL NOT be `#ffffff`
- **THEN** the element background SHALL match the dark surface token color defined by `add-theme-infrastructure`

### Requirement: Light mode appearance is unchanged
Adding dark variants SHALL NOT alter any component or page appearance when the `dark` class is absent from `<html>`.

#### Scenario: Light mode preservation after migration
- **WHEN** the `dark` class is NOT on `<html>`
- **THEN** all migrated components and pages SHALL render with identical appearance to before this change was applied

### Requirement: Unchanged color tokens remain consistent in both modes
Tokens designated as "unchanged" (primary, destructive, success) SHALL remain the same color in both light and dark modes — no dark variants are added for these tokens.

#### Scenario: Primary button color in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** a `primary` Button SHALL continue to display with `bg-primary` and `text-primary-fg` (no dark override)

#### Scenario: Destructive/error state in dark mode
- **WHEN** the `dark` class is on `<html>`
- **THEN** Input or PasswordInput in an error state SHALL continue to display with `border-destructive` (no dark override)
