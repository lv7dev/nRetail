## REMOVED Requirements

### Requirement: ThemeSwitcher is placed in all three app contexts
**Reason**: Having ThemeSwitcher and LanguageSwitcher on every authenticated screen (via AppLayout header) adds UI noise and clutters the header. Users should change theme/language in a dedicated settings context, not globally on every page.
**Migration**: ThemeSwitcher and LanguageSwitcher remain in `AuthLayout` and the Account page. Remove the AppLayout header row that contains them. Update `AppLayout.test.tsx` to remove assertions checking for their presence.

## ADDED Requirements

### Requirement: ThemeSwitcher is placed in AuthLayout and Account page only
The `ThemeSwitcher` component SHALL be rendered in exactly two contexts:
1. `AuthLayout` — next to `LanguageSwitcher` in the top-right floating area.
2. The Account page — as a settings row that labels the section "Theme" and renders the `ThemeSwitcher` inline.

`AppLayout` SHALL NOT render `ThemeSwitcher` or `LanguageSwitcher`.

#### Scenario: ThemeSwitcher present in AuthLayout
- **WHEN** any auth page is rendered
- **THEN** `ThemeSwitcher` SHALL be visible alongside `LanguageSwitcher` in the top-right area

#### Scenario: ThemeSwitcher present on Account page
- **WHEN** the Account page is rendered
- **THEN** a theme settings row containing `ThemeSwitcher` SHALL be visible

#### Scenario: ThemeSwitcher absent from AppLayout
- **WHEN** any authenticated app page is rendered via AppLayout
- **THEN** `AppLayout` SHALL NOT render `ThemeSwitcher` or `LanguageSwitcher` in its header
