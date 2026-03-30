## Why

The app currently uses Tailwind semantic tokens (`bg-surface`, `text-content`, `border-border`, etc.) for all component colors, but has no `dark:` variants applied anywhere. Without dark variants, switching to dark mode (via the `dark` class on `<html>`, provided by `add-theme-infrastructure`) has no visual effect on app components — they stay white and light-themed regardless. This change wires up the visual layer by adding `dark:` utility variants to every component and page file that uses semantic color tokens.

**Depends on**: `add-theme-infrastructure` — must be completed and merged first. That change adds the `dark` class toggle mechanism, extends `tailwind.config.js` with dark token values (`surface.dark`, `content.dark`, etc.), and sets `body[zaui-theme=dark]` for zmp-ui components.

## What Changes

- **16 TSX component/page files**: Add `dark:` variants alongside every existing semantic color token class (`bg-surface` → also `dark:bg-surface-dark`, etc.)
- **1 CSS file** (`src/css/app.css`): `.section-container` has a hardcoded `background: #ffffff` — add a `[html.dark] .section-container` rule to override it with the dark surface color
- No new components, no API changes, no data model changes
- All changes are purely additive (existing light classes are preserved; dark variants are appended)

## Capabilities

### New Capabilities

- `dark-mode-component-migration`: All app component and page files respond visually to the `dark` class on `<html>` using Tailwind `dark:` utility variants and the token set from `add-theme-infrastructure`

### Modified Capabilities

<!-- No existing specs have requirement changes. This is a new capability. -->

## Impact

- **Files changed**: 16 TSX files across `miniapp/src/components/` and `miniapp/src/pages/`, plus `miniapp/src/css/app.css`
- **Depends on**: `add-theme-infrastructure` change (new dark token values in `tailwind.config.js`, `dark` class toggle on `<html>`)
- **No breaking changes**: purely additive — existing light-mode appearance is unchanged
- **Testing**: Component tests with `dark` class applied to wrapper need updating to assert dark variants render; visual regression via Playwright E2E is the primary verification path
- **No backend changes**
