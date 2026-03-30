## Context

The miniapp uses Tailwind CSS with a semantic token layer defined in `tailwind.config.js`. Light-mode tokens like `bg-surface`, `text-content`, and `border-border` map to CSS custom properties. The `add-theme-infrastructure` change will extend this with parallel dark tokens (`surface.dark`, `content.dark`, etc.) and toggle a `dark` class on `<html>` using Tailwind's `darkMode: "class"` strategy.

This change is purely presentational: every file that uses a light semantic token class gets the corresponding `dark:` variant appended to the same element's `className`. No logic, state, or API changes are involved.

Current state of affected files:
- 8 UI component files under `components/ui/` use `bg-surface`, `text-content`, `border-border`, and related tokens
- 2 shared component files (`BottomNav`, `LanguageSwitcher`) use surface and border tokens
- 1 layout file (`AuthLayout`) uses `bg-surface`
- 6 auth page files use `text-content` and `text-content-muted`
- `src/css/app.css` has `.section-container { background: #ffffff }` — a hardcoded hex that bypasses the token system

## Goals / Non-Goals

**Goals:**
- Every element with a light semantic token class also has the corresponding `dark:` variant class
- `.section-container` in `app.css` shows the correct dark background color in dark mode
- No light-mode appearance changes whatsoever
- Change is completely self-contained to the frontend (`miniapp/`)

**Non-Goals:**
- Adding the `dark` class toggle mechanism (owned by `add-theme-infrastructure`)
- Migrating zmp-ui components (handled by `body[zaui-theme=dark]` in `add-theme-infrastructure`)
- Creating new components or refactoring component APIs
- Migrating app pages (`home`, `cart`, `orders`, `products`, `profile`, `splash`) — these pages currently contain no semantic color token classes and require no changes
- Adding dark mode to icons, images, or SVGs

## Decisions

### Decision 1: Append dark: variants inline — do not extract to CSS variables or component variants

**Chosen**: Add `dark:bg-surface-dark` directly alongside `bg-surface` in JSX `className` strings (and template literals where applicable).

**Alternatives considered**:
- Extract to a `cn()` helper with dark/light pairs — adds indirection without value for a one-to-one token mapping
- Use CSS variables with `[html.dark]` overrides in `app.css` — works for `.section-container` (which is already CSS), but would require converting all JSX classes to CSS which is a larger refactor
- Component `variant` maps — useful for complex theming, overkill for mechanical token mapping

**Rationale**: The token mapping is strictly mechanical and one-to-one. Inline dark variants keep the coloring intent co-located with the element, are easily auditable, and follow the Tailwind convention already in use throughout the codebase.

### Decision 2: Fix `.section-container` with a `[html.dark]` CSS rule in app.css

**Chosen**: Add `[html.dark] .section-container { background: <dark-surface-value>; }` to `app.css`.

**Alternatives considered**:
- Replace `.section-container` usage in JSX with a Tailwind class — requires touching every file that uses the `.section-container` class name, which is a separate refactor out of scope
- Convert to CSS custom property referencing the dark token — same outcome, slightly more indirection

**Rationale**: The class is defined in `app.css` as a utility class. Adding a targeted CSS dark override in the same file is the minimal, non-breaking approach. The `[html.dark]` selector matches Tailwind's `dark:` strategy (which adds `dark` class to `<html>`).

### Decision 3: Token mapping is strictly one-to-one (no creative reinterpretation)

The mapping table from the proposal is treated as authoritative. Tokens flagged "unchanged" (primary, destructive, success) are left exactly as-is — they intentionally remain the same in both modes.

## Risks / Trade-offs

- **Risk: Missing files** — If a component file added after this list was compiled uses semantic tokens, it won't be covered. Mitigation: run a grep for `bg-surface\|text-content\|border-border` after implementation to confirm zero uncovered usages.
- **Risk: dark token values not yet available** — This change depends on `add-theme-infrastructure` defining the dark tokens in `tailwind.config.js`. If implemented before that change, Tailwind will warn about unknown utilities. Mitigation: this change must not be merged until `add-theme-infrastructure` is merged.
- **Trade-off: Inline class strings grow longer** — `className="bg-surface dark:bg-surface-dark"` is more verbose than before. Accepted: this is the standard Tailwind dark mode pattern and is universally readable.

## Migration Plan

1. Merge `add-theme-infrastructure` first (provides dark tokens + toggle)
2. Apply this change file-by-file in task order (UI components → shared components → layouts → auth pages → CSS)
3. After each group, run `npm run test` to verify no regressions
4. Visual verification: toggle dark mode in the running app and confirm each migrated component switches correctly
5. Rollback: each file change is purely additive — revert is a clean git revert of the diff

## Open Questions

- None. Token mapping is fully specified in the proposal. File list is exhaustive (confirmed by grep).
