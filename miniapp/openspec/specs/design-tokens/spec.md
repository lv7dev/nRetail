## ADDED Requirements

### Requirement: Tailwind uses class-based dark mode
The project SHALL use `darkMode: "class"` in `tailwind.config.js`. Dark mode activates when the `dark` class is present on `<html>`.

#### Scenario: Dark mode activates via class
- **WHEN** `<html class="dark">` is set
- **THEN** all `dark:` Tailwind variants apply to descendant elements

### Requirement: Semantic color tokens are defined
`tailwind.config.js` SHALL define semantic color tokens under `theme.extend.colors` covering: `primary`, `surface`, `border`, `content`, `destructive`, `success`.

#### Scenario: Primary token available as Tailwind class
- **WHEN** a component uses `bg-primary`
- **THEN** it renders with the defined primary color (`#4f46e5`)

#### Scenario: Surface muted token available
- **WHEN** a component uses `bg-surface-muted`
- **THEN** it renders with the muted surface color (`#f4f4f5`)

#### Scenario: Content muted token available
- **WHEN** a component uses `text-content-muted`
- **THEN** it renders with the muted text color (`#71717a`)
