## MODIFIED Requirements

### Requirement: AuthLayout LanguageSwitcher clears OS status bar
The LanguageSwitcher in AuthLayout SHALL be positioned so that its top edge clears both the OS status bar and the Zalo mini-app chrome strip. The vertical offset SHALL be `var(--zalo-chrome-top)`, where `--zalo-chrome-top` is defined globally as `calc(var(--zaui-safe-area-inset-top, 0px) + 2.6rem)`. The `2.6rem` represents the empirical height of Zalo's minimal chrome strip (visible even with `actionBarHidden: true`).

#### Scenario: LanguageSwitcher visible on device with transparent status bar
- **WHEN** the user opens any auth page on a Zalo device where `--zaui-safe-area-inset-top` is greater than `0px`
- **THEN** the LanguageSwitcher button SHALL be fully visible below both the OS status bar and Zalo chrome strip

#### Scenario: LanguageSwitcher position unchanged in non-Zalo environment
- **WHEN** `--zaui-safe-area-inset-top` is not set (e.g., browser dev mode or Playwright)
- **THEN** the LanguageSwitcher SHALL be positioned `2.6rem` from the top (fallback `0px` + `2.6rem`)
