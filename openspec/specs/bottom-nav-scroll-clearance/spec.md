## Requirement: BottomNav exposes its rendered height as a CSS variable
`BottomNav` SHALL use a `ResizeObserver` to measure its own rendered height on mount and write the value to `document.documentElement` as `--bottom-nav-height` (in `px`). The observer SHALL disconnect on component unmount.

### Scenario: CSS variable is set on mount
- **WHEN** `BottomNav` mounts
- **THEN** `document.documentElement` SHALL have `--bottom-nav-height` set to the nav's rendered height in pixels

### Scenario: Observer disconnects on unmount
- **WHEN** `BottomNav` unmounts
- **THEN** the `ResizeObserver` SHALL be disconnected

## Requirement: AppLayout page-content clears the BottomNav
`AppLayout`'s `page-content` div SHALL apply `paddingBottom` equal to `calc(var(--bottom-nav-height, 3.5rem) + var(--zaui-safe-area-inset-bottom, 0px))` so that scrollable content is never obscured by the fixed navigation bar.

### Scenario: Content is not obscured after nav height is measured
- **WHEN** `AppLayout` renders with a `BottomNav` present
- **THEN** the `page-content` div SHALL have a `paddingBottom` style using `--bottom-nav-height`

### Scenario: Fallback prevents layout flash on first render
- **WHEN** `AppLayout` renders before `--bottom-nav-height` is set
- **THEN** the `page-content` div SHALL use the `3.5rem` fallback value
