## Context

The `Icon` component loads SVG files via `?react` imports and renders them as React components. The SVG `<path>` elements have no `fill` attribute, so browsers apply the SVG default of `fill="black"`. The Icon component passes only `width`, `height`, and `className` to the rendered SVG — it never sets `fill`.

As a result, all icons ignore the surrounding text color and are always black, making them invisible on dark backgrounds.

BottomNav compounds this by setting icon color via inline `style={{ color: ... }}` with hardcoded hex values (`#71717a` inactive, `#4f46e5` active). Inline styles take precedence over class-based CSS, so `dark:` Tailwind variants on the element have no effect.

## Goals / Non-Goals

**Goals:**
- Icons inherit their color from CSS `color` / `text-*` Tailwind classes
- BottomNav inactive icons lighten in dark mode
- All existing icon usages (LanguageSwitcher, ThemeSwitcher, PasswordInput) work correctly without changes to those components

**Non-Goals:**
- Changing icon sizes, variants, or the SVG asset library
- Adding per-icon color overrides or a `color` prop to Icon

## Decisions

### Decision 1: Set `fill="currentColor"` as a prop on the SVG root, not as a CSS class

SVG `fill` can be controlled via CSS (`fill: currentColor`) or via the `fill` attribute. Setting it as a prop (`fill="currentColor"`) on the root `<svg>` element is more reliable — it cascades to all descendant `<path>` elements that have no explicit fill, regardless of CSS specificity ordering.

`SvgComponent` is typed as `ComponentType<SVGProps<SVGSVGElement>>`, so passing `fill="currentColor"` as a prop is type-safe.

**Alternative considered:** Tailwind's `fill-current` class — equivalent effect but requires ensuring the class is not purged and adds a CSS layer. The prop approach is more direct.

### Decision 2: Replace BottomNav inline style with conditional Tailwind classes

Replace `style={{ color: isActive ? '#4f46e5' : '#71717a' }}` with:
- Active: `text-primary` (same indigo in both modes — `primary` token has no dark variant by design)
- Inactive: `text-content-muted dark:text-content-dark-muted`

This removes the inline style entirely, allowing `dark:` class variants to take effect.

**Alternative considered:** Keep inline style but compute the color based on dark mode state (e.g., read `useThemeStore`). Rejected — Tailwind classes are the project convention and don't require reading store state in the component.

## Risks / Trade-offs

- **SVGs with explicit fill colors** → `fill="currentColor"` on the root only cascades to paths with no fill. If any SVG path has `fill="#000"` hardcoded, it won't change. Inspection of the actual SVG files confirms paths have no fill attributes, so this is safe.
- **`text-primary` has no dark variant** → active nav items stay indigo in dark mode. This is intentional per the token design.

## Migration Plan

No migration needed. Changes are purely additive/substitutive within two files. No localStorage, no API, no stored state involved.
