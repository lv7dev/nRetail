## MODIFIED Requirements

### Requirement: ScrollablePage reports scroll-driven collapse state via onCollapsedChange
`ScrollablePage` SHALL emit `onCollapsedChange` with a hysteresis band to prevent spurious flips caused by iOS elastic scroll bounce. The rules are:

- Emit `onCollapsedChange(false)` when `scrollTop` reaches exactly `0`
- Emit `onCollapsedChange(true)` when `scrollTop` reaches `COLLAPSE_THRESHOLD_PX` (20) or above
- Emit nothing when `scrollTop` is between `1` and `COLLAPSE_THRESHOLD_PX - 1` (dead zone)
- Never emit the same value consecutively — deduplicate adjacent identical emissions

The scroll container SHALL have `overscroll-behavior-y: contain` applied to reduce iOS elastic bounce propagation.

#### Scenario: Collapsed emitted when scrolled past threshold
- **WHEN** the user scrolls down and `scrollTop` reaches `20px` or beyond
- **THEN** `onCollapsedChange(true)` is emitted once

#### Scenario: Expanded emitted when back at top
- **WHEN** the user scrolls up and `scrollTop` reaches exactly `0`
- **THEN** `onCollapsedChange(false)` is emitted once

#### Scenario: Dead zone emits nothing
- **WHEN** `scrollTop` is between `1` and `19px` (inclusive)
- **THEN** `onCollapsedChange` is NOT called

#### Scenario: iOS bounce oscillation absorbed by dead zone
- **WHEN** `scrollTop` oscillates between `0` and values below `20px` (iOS elastic bounce)
- **THEN** `onCollapsedChange` is called at most once with `false` when `scrollTop` hits `0` — no interleaved `true` emissions

#### Scenario: Consecutive same-value emissions deduplicated
- **WHEN** `scrollTop` moves between two values both above the collapse threshold (e.g. 30px → 50px → 80px)
- **THEN** `onCollapsedChange(true)` is emitted only once, not on every scroll tick

#### Scenario: No emission when onCollapsedChange not provided
- **WHEN** the `onCollapsedChange` prop is not provided
- **THEN** no error is thrown and scroll behaviour is unaffected
