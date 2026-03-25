## Why

The miniapp has no reusable UI component library — pages use inline styles, emoji icons, and ad-hoc Tailwind classes. Building a consistent, tested component library now establishes the visual foundation for all future features and ensures AI agents follow consistent patterns when generating UI code.

## What Changes

- Move Font Awesome 6 Pro SVGs to `src/assets/icons/` (organized by style)
- Add `vite-plugin-svgr` devDependency for SVG-as-React-component imports
- Add `clsx` and `tailwind-merge` dependencies
- Add `src/utils/cn.ts` — `cn()` helper for conditional Tailwind class merging
- Update `tailwind.config.js`: change `darkMode` to `"class"`, add design tokens (zinc neutrals + indigo accent)
- Add `src/components/CLAUDE.md` — AI and human convention file for component authoring
- Add four foundational UI components under `src/components/ui/`:
  - `Button` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
  - `Icon` — wraps FA6 Pro SVGs; props: name, variant (solid/regular/light/thin/brands), size
  - `Input` — text input with label, placeholder, error state, disabled state
  - `Checkbox` — with label, checked state, disabled state
- Update `src/components/ui/index.ts` barrel export

## Capabilities

### New Capabilities
- `ui-button`: Button component with variants and sizes
- `ui-icon`: Icon component wrapping Font Awesome 6 Pro SVGs
- `ui-input`: Input component with label and validation states
- `ui-checkbox`: Checkbox component with label and states
- `design-tokens`: Tailwind design token system (colors, dark mode class strategy)
- `component-conventions`: CLAUDE.md conventions for component authoring

### Modified Capabilities
- None

## Impact

- `miniapp/tailwind.config.js` — darkMode strategy change (`zaui-theme` selector → `"class"`), token additions
- `miniapp/vite.config.mts` — add svgr plugin
- `miniapp/package.json` — add `clsx`, `tailwind-merge` (deps), `vite-plugin-svgr` (devDep)
- `miniapp/src/assets/icons/` — new directory with FA6 Pro SVGs
- `miniapp/src/utils/cn.ts` — new utility
- `miniapp/src/components/CLAUDE.md` — new convention file
- `miniapp/src/components/ui/` — four new component folders + updated barrel
- `miniapp/src/components/shared/BottomNav.tsx` — update emoji icons to use `<Icon>` component
