## Context

`CollapsibleHeader` renders a primary-colored header zone with an optional card that overlaps its bottom edge. The overlap effect is currently produced by two paired Tailwind classes: `pb-8` (32px bottom padding on topZone) and `mt-[-32px]` (negative margin on card shell). A third class `rounded-b-3xl` controls the bottom corner radius of the topZone when a card is present. All three are hardcoded and invisible to callers.

The component is used by the home page today and will be adopted by other pages for its `var(--zalo-chrome-top)` safe-area handling and `decoration` support. Those pages may or may not use a card, and if they do, the overlap depth or radius may differ.

## Goals / Non-Goals

**Goals:**
- Expose `cardOverlap: number` (default `32`) and `cardRadius: string` (default `'rounded-b-3xl'`) as props
- Derive the bottom padding and negative margin from `cardOverlap` at runtime
- Replace template-literal string concatenation with `cn()` throughout the component
- Zero breaking changes: existing callers that pass no props get identical behavior

**Non-Goals:**
- Changing the card slot API (`card`, `collapsed`, `scrollContainerRef`)
- Changing the `decoration` or `topBar` / `children` slots
- Making `cardOverlap` accept non-pixel units (always pixels)

## Decisions

### Decision: Use inline styles for the dynamic pixel values, `cn()` for static classes

Tailwind's JIT engine purges classes it doesn't see as static strings in source. A dynamic class like `` `pb-[${cardOverlap}px]` `` would be purged in production. The safe pattern is:

```tsx
// topZone — static classes via cn(), dynamic padding via style
<div
  className={cn('relative overflow-hidden bg-primary', renderedCard && cardRadius)}
  style={renderedCard ? { paddingBottom: `${cardOverlap}px` } : undefined}
>

// card shell — static classes via cn(), dynamic margin via style
<div
  className={cn('relative px-4')}
  style={{ marginTop: `-${cardOverlap}px` }}
>
```

**Alternative considered**: Tailwind safelist — add the generated class strings to `tailwind.config.js` safelist. Rejected: requires updating the safelist whenever the default changes, and makes the component's styling leak into global config.

**Alternative considered**: CSS custom property — set `--card-overlap` on the wrapper and reference it in child styles. Rejected: requires either a style prop on the root element or CSS that's harder to read than the current approach.

### Decision: `cardRadius` accepts a Tailwind class string, not an enum

Accepting a string (`'rounded-b-xl'`, `'rounded-b-3xl'`, `'rounded-b-none'`) is flexible and doesn't require the component to know all possible Tailwind radius values. Since it feeds into `cn()`, invalid values are harmlessly ignored by the browser.

**Alternative considered**: `cardRadius?: 'sm' | 'md' | 'lg' | 'none'` mapped to Tailwind classes. Rejected: adds a mapping table for values Tailwind already names; the caller knows Tailwind.

### Decision: `marginTop` on the card shell is always set (not conditional on collapsed state)

After the previous cleanup, the card shell no longer toggles between `sticky` and `relative`. The `mt-[-N]px` negative margin is structural — it applies in both expanded and collapsed visual states. Setting it unconditionally via `style={{ marginTop: ... }}` simplifies the code.

## Risks / Trade-offs

- **[Risk]** A caller passes a `cardRadius` string that doesn't produce a rounded bottom (e.g., `'rounded-t-xl'`) → visually inconsistent but not a runtime error. Mitigation: document the prop as "Tailwind `rounded-b-*` class applied to the topZone bottom edge when a card is present."
- **[Trade-off]** Mixing inline `style` and `className` is slightly less readable than pure Tailwind. This is unavoidable for dynamic pixel values without safelisting.
