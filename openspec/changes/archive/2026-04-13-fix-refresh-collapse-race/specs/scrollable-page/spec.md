## ADDED Requirements

### Requirement: Pull gesture prevents container scroll for its duration
While a pull-to-refresh gesture is active (finger has moved downward past the direction threshold from `scrollTop === 0`), `ScrollablePage` SHALL prevent the scroll container from scrolling. This ensures `onCollapsedChange` is not fired during an active pull gesture, eliminating the simultaneous refresh + collapse condition.

#### Scenario: Container does not scroll while pulling
- **WHEN** the user begins a downward pull gesture at `scrollTop === 0` and the direction threshold is met
- **THEN** the scroll container's `scrollTop` remains `0` for the duration of the gesture

#### Scenario: Collapse does not fire during an active pull gesture
- **WHEN** a pull gesture is active and `pullDistance > 0`
- **THEN** `onCollapsedChange` is NOT called

#### Scenario: Normal scroll resumes after pull gesture ends
- **WHEN** the pull gesture ends (finger lifts) without triggering refresh
- **THEN** the scroll container resumes normal scroll behaviour on the next touch sequence

---

### Requirement: Wheel refresh requires a settle period after arriving at the top
After `scrollTop` transitions to `0`, `ScrollablePage` SHALL suppress wheel-triggered refresh for 400 ms. This prevents an accidental refresh fire on the first upward wheel tick after scrolling back to the top, which would collide with the card expand animation.

#### Scenario: Wheel refresh blocked immediately after scroll-to-top
- **WHEN** the user wheels upward and `scrollTop` just reached `0`
- **THEN** `onRefresh` is NOT called if fewer than 400 ms have elapsed since `scrollTop` first became `0`

#### Scenario: Wheel refresh allowed after settle period
- **WHEN** the user wheels upward at `scrollTop === 0` and at least 400 ms have elapsed since arriving at the top
- **THEN** `onRefresh` is called normally

#### Scenario: Wheel refresh allowed when page opens at top
- **WHEN** the page mounts with `scrollTop === 0` and the user wheels upward without having scrolled at all
- **THEN** `onRefresh` is called normally (no prior scroll-to-top event, no settle period applies)
