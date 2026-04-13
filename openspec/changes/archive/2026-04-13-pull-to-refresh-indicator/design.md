## Context

`ScrollablePage` renders a spinner at the top whenever `pullDistance > 0 || isRefreshing`. The `pullDistance` state already tracks exact finger distance (0–120px, capped). The 60px trigger threshold already exists in `handleTouchEnd`. All the raw data needed for a staged indicator is already present — only the rendering logic needs to change.

The wheel path (`handleWheel`) sets `pullDistance = 60` then immediately calls `onRefresh()` — it bypasses the gesture entirely and jumps straight to the spinner. This behaviour is kept unchanged.

## Goals / Non-Goals

**Goals:**
- Elastic-height indicator container: height tracks `pullDistance` up to 48px
- Below threshold (0 < pullDistance < 60): `chevron-down` icon + "Pull down to refresh"
- Above threshold (pullDistance ≥ 60): icon flips 180°, text swaps to "Release to refresh"
- After release (isRefreshing, pullDistance reset): spinner replaces the text indicator
- Text labels via `useTranslation('common')`, keys `scrollablePage.pullToRefresh` / `scrollablePage.releaseToRefresh`
- Zero breaking changes to `ScrollablePageProps`

**Non-Goals:**
- Changing the 60px trigger threshold
- Haptic feedback
- Changing wheel refresh behavior
- Animating the elastic height itself (height tracks pullDistance directly — no spring physics)

## Decisions

### Decision: Inline `PullIndicator` in `ScrollablePage`, not a separate file

The indicator is tightly coupled to `pullDistance` and `isRefreshing` state that lives in `ScrollablePage`. Extracting it would require passing 3+ props to a component used in exactly one place. Keep it as an internal sub-component in the same file (like the existing `Spinner`).

**Alternative considered**: Separate `PullRefreshIndicator.tsx` component. Rejected — single-use component, adds file overhead with no reuse benefit.

### Decision: Elastic height via inline `style`, not Tailwind arbitrary values

`pullDistance` is a runtime number. `h-[${pullDistance}px]` would be purged by Tailwind JIT in production. Use `style={{ height: Math.min(pullDistance, 48) }}` on the container instead. The 48px cap keeps the indicator from growing too tall during an overscroll.

**Alternative considered**: Fixed 48px height that snaps in when `pullDistance > 0`. Rejected — the elastic feel matches native PTR and is a key UX requirement from the user.

### Decision: CSS `transition` on `transform: rotate` for the arrow flip

When `pullDistance` crosses 60px, the `chevron-down` icon transitions from `rotate(0deg)` to `rotate(180deg)`. Use a Tailwind `transition-transform duration-200` class on the icon wrapper, toggling a `rotate-180` class. This gives a smooth flip without a JS animation frame loop.

**Alternative considered**: Swap between `chevron-down` and `chevron-up` icons. Rejected — an instant icon swap looks abrupt; the rotation transition feels more physical and is a one-liner with Tailwind.

### Decision: `common` namespace for i18n keys, under `scrollablePage.*`

`ScrollablePage` is a shared component. Placing its strings in the `common` namespace (already loaded app-wide) avoids adding a new namespace load. Prefix with `scrollablePage.` to avoid key collisions.

Keys:
- `scrollablePage.pullToRefresh` → "Kéo xuống để làm mới" (vi) / "Pull down to refresh" (en)
- `scrollablePage.releaseToRefresh` → "Thả để làm mới" (vi) / "Release to refresh" (en)

**Alternative considered**: New `scrollablePage` namespace. Rejected — `common` is already loaded everywhere; a new namespace adds an async load for two strings.

### Decision: Show spinner (not text indicator) during `isRefreshing`

After `touchEnd`, `pullDistance` is reset to `0` and `isRefreshing` becomes `true`. At `pullDistance = 0`, the elastic container collapses. The `isRefreshing` spinner takes over in its own fixed-height container (existing `Spinner` component). This keeps the two states visually distinct and avoids any height-jump awkwardness.

## Risks / Trade-offs

- **[Risk]** The elastic container at small `pullDistance` values (e.g. 5px) shows a very thin sliver. → Acceptable — at that height the content is clipped and invisible; it only becomes meaningful past ~20px. No minimum height is needed.
- **[Trade-off]** Mixing inline `style` (height) and Tailwind (everything else) on the indicator container. Unavoidable for runtime pixel values — consistent with the `CollapsibleHeader` pattern already established in this codebase.
- **[Risk]** `useTranslation` inside `ScrollablePage` adds an i18n dependency to a currently pure component. → Acceptable — the `common` namespace is loaded before `ScrollablePage` ever renders.
