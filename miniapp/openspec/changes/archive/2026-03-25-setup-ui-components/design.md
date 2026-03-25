## Context

The miniapp is a Zalo Mini App (React 18 + Vite + TypeScript + Tailwind). Currently `src/components/ui/` exists as an empty barrel. Pages use ad-hoc inline styles and emoji icons. `zmp-ui` is installed but intentionally unused — all UI components will be built in-house for full control.

Font Awesome 6 Pro SVGs (6.1.0) are available locally at `src/static/fontawesome-pro-6.1.0-desktop/svgs/`.

## Goals / Non-Goals

**Goals:**
- Establish design tokens (color palette, dark mode strategy) in Tailwind config
- Provide `cn()` utility for composable Tailwind class merging
- Set up SVG icon imports via vite-plugin-svgr
- Deliver four foundational components: Button, Icon, Input, Checkbox
- Document component conventions in `src/components/CLAUDE.md`
- Unit tests for all components (Vitest + React Testing Library)

**Non-Goals:**
- Full design system (no Storybook, no visual docs site)
- Duotone icon support (two-layer SVG complexity — deferred)
- Dark mode toggle UI (dark mode *infrastructure* only, toggle deferred)
- Animation/transition library
- Form library integration (react-hook-form wiring deferred to feature work)

## Decisions

### 1. Dark mode strategy: `"class"` over Zalo's `zaui-theme` selector

`tailwind.config.js` initializes with `darkMode: ["selector", '[zaui-theme="dark"]']` — Zalo's theme system. Replacing with `darkMode: "class"` means toggling dark mode by adding/removing the `dark` class on `<html>`. This is the standard Vite/React pattern, simpler to control independently of the Zalo shell.

**Alternative considered**: Keep `zaui-theme` and build a wrapper that sets it. Rejected — ties dark mode to Zalo's API, complicates testing.

### 2. Design tokens: semantic names over raw scale values

Components use semantic Tailwind tokens (`bg-surface`, `text-on-surface`, `bg-primary`) rather than literal scale values (`bg-white`, `bg-indigo-600`). Tokens are defined in `tailwind.config.js` `theme.extend.colors` and map to CSS variables for easy future dark mode swapping.

Token palette:
```js
colors: {
  primary: {
    DEFAULT: '#4f46e5',   // indigo-600
    hover:   '#4338ca',   // indigo-700
    fg:      '#ffffff',   // text on primary bg
  },
  surface: {
    DEFAULT: '#ffffff',   // page background
    muted:   '#f4f4f5',   // zinc-100: cards, inputs
    overlay: '#e4e4e7',   // zinc-200: hover states
  },
  border: {
    DEFAULT: '#d4d4d8',   // zinc-300
    strong:  '#a1a1aa',   // zinc-400
  },
  content: {
    DEFAULT: '#18181b',   // zinc-900: primary text
    muted:   '#71717a',   // zinc-500: secondary text
    subtle:  '#a1a1aa',   // zinc-400: placeholder
    inverse: '#ffffff',   // text on dark bg
  },
  destructive: {
    DEFAULT: '#ef4444',   // red-500
    fg:      '#ffffff',
  },
  success: {
    DEFAULT: '#22c55e',   // green-500
    fg:      '#ffffff',
  },
}
```

### 3. Icon import: vite-plugin-svgr over alternatives

SVGs imported with `?react` suffix become React components. Color is controlled via `currentColor` — icons inherit the CSS text color automatically, making dark mode free.

```ts
// Icon component internals:
const mod = await import(`@/assets/icons/${variant}/${name}.svg?react`)
// → renders inline SVG, styled with className="text-primary"
```

**Alternative considered**: Pre-baked TSX registry (manually wrapping each SVG). Rejected — maintenance burden at 3,000+ icons.

**FA SVG location**: Move from `src/static/fontawesome-pro-6.1.0-desktop/svgs/` to `src/assets/icons/`. The `assets/` directory is the Vite convention for imported source assets (vs `static/` for served-as-is files).

### 4. Component file structure: folder per component

```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
```

Keeps tests co-located with the component. The `index.ts` re-exports the component for clean imports: `import { Button } from '@/components/ui'`.

### 5. `cn()` utility: clsx + tailwind-merge

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

`clsx` handles conditional classes; `tailwind-merge` deduplicates conflicting Tailwind utilities (e.g., `cn('px-4', 'px-6')` → `px-6`).

## Risks / Trade-offs

- **[Risk]** Dynamic SVG imports (`import(\`...${name}...\`)`) are harder for Vite to statically analyze → Mitigation: document this in CLAUDE.md; lazy-load Icon component if bundle becomes an issue
- **[Risk]** Changing `darkMode` from `zaui-theme` selector breaks if Zalo platform injects dark styles → Mitigation: zmp-ui is intentionally unused; no component depends on the zaui-theme selector
- **[Risk]** 15,000+ SVGs committed to git increases initial clone size → Mitigation: SVGs are plain text, Vite bundles only what's imported; acceptable tradeoff for offline reliability
- **[Risk]** Semantic token names don't cover every use case → Mitigation: CLAUDE.md documents fallback (use raw Tailwind scale for one-off values, add token if reused 3+ times)
