## Requirements

### Requirement: Pull indicator is hidden at rest
When no pull gesture is in progress and the page is not refreshing, no indicator SHALL be visible above the scroll content.

#### Scenario: Indicator hidden at rest
- **WHEN** `pullDistance` is `0` and `isRefreshing` is `false`
- **THEN** no indicator element is rendered above the scroll content

---

### Requirement: Pull indicator grows elastically with finger distance below threshold
While the user is pulling down and `pullDistance` is between 1 and 59px, the indicator container SHALL have a height equal to `min(pullDistance, 48)px` (inline style). It SHALL display the `chevron-down` icon and the i18n label `scrollablePage.pullToRefresh`.

#### Scenario: Indicator appears and grows as user pulls
- **WHEN** `pullDistance` is greater than `0` and less than `60`
- **THEN** the indicator container height equals `min(pullDistance, 48)px`, the chevron icon points downward, and the "Pull down to refresh" label is visible

#### Scenario: Height caps at 48px
- **WHEN** `pullDistance` exceeds `48`
- **THEN** the indicator container height stays at `48px` and does not grow further

---

### Requirement: Pull indicator signals ready-to-release above threshold
When `pullDistance` is 60px or greater, the indicator SHALL flip the chevron icon 180° (via CSS `rotate-180` class with a `transition-transform duration-200` transition) and swap the label to `scrollablePage.releaseToRefresh`.

#### Scenario: Arrow flips and text changes at threshold
- **WHEN** `pullDistance` reaches `60` or above
- **THEN** the chevron icon has the `rotate-180` class applied and the label reads "Release to refresh"

#### Scenario: Arrow returns and text reverts below threshold
- **WHEN** `pullDistance` drops back below `60`
- **THEN** the chevron icon no longer has the `rotate-180` class and the label reads "Pull down to refresh"

---

### Requirement: Spinner replaces text indicator during active refresh
Once the user releases and `isRefreshing` becomes `true`, `pullDistance` is reset to `0`. The indicator SHALL show the spinner (not the text/arrow indicator) for the duration of the refresh.

#### Scenario: Spinner shown while refreshing
- **WHEN** `isRefreshing` is `true` and `pullDistance` is `0`
- **THEN** the spinner is visible and no text/arrow indicator is shown

#### Scenario: Spinner hidden after refresh completes
- **WHEN** `isRefreshing` transitions to `false`
- **THEN** the spinner is no longer visible

---

### Requirement: Pull indicator text uses i18n from the common namespace
The two label strings SHALL come from `useTranslation('common')` using keys `scrollablePage.pullToRefresh` and `scrollablePage.releaseToRefresh`. Both `vi` and `en` locale files SHALL have entries for these keys.

#### Scenario: Vietnamese label rendered
- **WHEN** the app language is `vi` and `pullDistance` is between `1` and `59`
- **THEN** the indicator shows "Kéo xuống để làm mới"

#### Scenario: English label rendered
- **WHEN** the app language is `en` and `pullDistance` is between `1` and `59`
- **THEN** the indicator shows "Pull down to refresh"
