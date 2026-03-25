# Spec: Zalo Safe Area

This spec defines requirements for handling Zalo Mini App safe-area insets so that UI elements are never obscured by the OS status bar, home indicator, or system navigation bar.

---

### Requirement: AuthLayout LanguageSwitcher clears OS status bar
The LanguageSwitcher in AuthLayout SHALL be positioned so that its top edge clears both the OS status bar and the Zalo mini-app chrome strip. The vertical offset SHALL be `var(--zalo-chrome-top)`, where `--zalo-chrome-top` is defined globally as `calc(var(--zaui-safe-area-inset-top, 0px) + 2.6rem)`. The `2.6rem` represents the empirical height of Zalo's minimal chrome strip (visible even with `actionBarHidden: true`).

#### Scenario: LanguageSwitcher visible on device with transparent status bar
- **WHEN** the user opens any auth page on a Zalo device where `--zaui-safe-area-inset-top` is greater than `0px`
- **THEN** the LanguageSwitcher button SHALL be fully visible below both the OS status bar and Zalo chrome strip

#### Scenario: LanguageSwitcher position unchanged in non-Zalo environment
- **WHEN** `--zaui-safe-area-inset-top` is not set (e.g., browser dev mode or Playwright)
- **THEN** the LanguageSwitcher SHALL be positioned `2.6rem` from the top (fallback `0px` + `2.6rem`)

### Requirement: AppLayout page content clears OS status bar
The page content area in AppLayout SHALL have a top padding equal to `var(--zaui-safe-area-inset-top, 0px)` so that no content is obscured by the transparent OS status bar.

#### Scenario: Page content not hidden under status bar
- **WHEN** the user navigates to any app page (inside AppLayout) on a device with a transparent status bar
- **THEN** the topmost content of the page SHALL be fully visible below the status bar

#### Scenario: No extra padding in non-Zalo environment
- **WHEN** `--zaui-safe-area-inset-top` is not set
- **THEN** the page content SHALL have zero top padding from the safe-area variable

### Requirement: BottomNav clears device home indicator and system nav bar
The BottomNav SHALL be positioned so its bottom edge sits above the device home indicator (iOS) or system navigation bar (Android). The bottom offset SHALL be `var(--zaui-safe-area-inset-bottom, 0px)`. The Zalo app config SHALL have `hideIOSSafeAreaBottom: false` so the iOS WebView receives the real bottom inset.

#### Scenario: BottomNav fully visible on device with home indicator
- **WHEN** the user is on a device where `--zaui-safe-area-inset-bottom` is greater than `0px`
- **THEN** the BottomNav SHALL be fully visible above the home indicator or system nav bar

#### Scenario: BottomNav flush with viewport bottom in non-Zalo environment
- **WHEN** `--zaui-safe-area-inset-bottom` is not set
- **THEN** the BottomNav SHALL sit at `bottom: 0` (default behavior preserved)

### Requirement: Safe-area utility classes available globally
The app stylesheet SHALL expose `.pt-safe` and `.pb-safe` utility classes that apply `--zaui-safe-area-inset-top` and `--zaui-safe-area-inset-bottom` padding respectively, for use by any future component.

#### Scenario: Utility classes apply correct padding
- **WHEN** any element has the class `pt-safe`
- **THEN** it SHALL receive `padding-top: var(--zaui-safe-area-inset-top, 0px)`

#### Scenario: pb-safe utility class applies bottom padding
- **WHEN** any element has the class `pb-safe`
- **THEN** it SHALL receive `padding-bottom: var(--zaui-safe-area-inset-bottom, 0px)`
