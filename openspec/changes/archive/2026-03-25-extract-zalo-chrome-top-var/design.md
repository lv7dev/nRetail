## Context

`AuthLayout.tsx` positions the LanguageSwitcher with:
```tsx
style={{ top: "calc(var(--zaui-safe-area-inset-top, 0px) + 2.6rem)" }}
```

The `2.6rem` is an empirical constant for the Zalo mini-app chrome strip height (the "..." × controls Zalo renders even with `actionBarHidden: true`). Zalo does not expose a CSS variable for this value. The magic number is currently buried inside a component inline style.

## Goals / Non-Goals

**Goals:**
- Extract the combined offset into a named CSS custom property `--zalo-chrome-top` on `:root`
- Replace the inline `calc()` in `AuthLayout.tsx` with `var(--zalo-chrome-top)`
- Make the 2.6rem constant easy to find and update in one place

**Non-Goals:**
- Dynamically reading the Zalo chrome height at runtime (no JS bridge call)
- Changing the visual behaviour or offset value
- Applying `--zalo-chrome-top` to any component other than `AuthLayout` — it is specific to auth page top-right positioning

## Decisions

### Define on `:root` in `app.css`, not as a Tailwind utility
`--zalo-chrome-top` is a positioning value (used with CSS `top:`), not a spacing/padding utility. Tailwind utilities are padding/margin oriented. A `:root` CSS variable is the right primitive for a positioning constant.

### Keep the 2.6rem constant inline in the variable definition
```css
:root {
  --zalo-chrome-top: calc(var(--zaui-safe-area-inset-top, 0px) + 2.6rem);
}
```
The 2.6rem lives here and nowhere else. If Zalo changes their chrome height, this is the single edit point.

## Risks / Trade-offs

- **[Risk] Zalo changes chrome height** → Mitigation: single edit in `app.css` `:root` block now fixes everywhere it's used.
- **[Risk] Variable name could be confused with `--zaui-safe-area-inset-top`** → Mitigation: `--zalo-chrome-top` name makes clear it includes Zalo app chrome (not just OS safe area).
