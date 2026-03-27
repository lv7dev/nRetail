# Component Conventions

## Folder Structure

Each UI component lives in its own folder under `src/components/ui/`:

```
src/components/ui/
├── Button/
│   ├── Button.tsx        # Component implementation
│   ├── Button.test.tsx   # Co-located tests
│   └── index.ts          # Barrel export
```

All components are re-exported from `src/components/ui/index.ts`.

## Props Rules

- Every component accepts `className?: string` and merges it via `cn()`
- Interfaces are named `<ComponentName>Props` (e.g., `ButtonProps`)
- Form elements (Input, Checkbox, etc.) use `React.forwardRef` to expose the underlying DOM element
- Spread all relevant HTML element props via `...props` so consumers can pass any native attribute

## Styling Rules

- Always use `cn()` from `@/utils/cn` for class merging — never string concatenation
- Use semantic design tokens (`bg-primary`, `text-content-muted`, `border-destructive`) — not raw Tailwind scale values (`bg-indigo-600`)
- No inline `style` props unless the value cannot be expressed in Tailwind (e.g., dynamic pixel values, CSS custom property positioning like `var(--zalo-chrome-top)` or `var(--zaui-safe-area-inset-bottom)`)
- Dark mode via `dark:` prefix — never `[zaui-theme="dark"]` selectors

## Icon Rules

- Import icons as React components using the `?react` suffix: `import HomeIcon from '@/assets/icons/solid/house.svg?react'`
- Use the `<Icon>` component for all icons — do not import SVGs directly in page/component code
- Icon color is inherited via `currentColor` — control with `text-*` Tailwind classes
- Icon sizes are set via the `size` prop (number, pixels)

## Button Loading State

`Button` accepts a `loading?: boolean` prop. When `true`:
- Replaces button content with an SVG spinner
- Applies `pointer-events-none` to prevent double-clicks

```tsx
<Button loading={isPending} type="submit">
  {t('login.submit')}
</Button>
```

Always wire `isPending` from a TanStack Query mutation to the submit button. Never manage submit loading state with `useState`.

## Testing Rules

- Tests are co-located as `<ComponentName>.test.tsx` in the same folder
- Use Vitest + React Testing Library
- Test: renders, all variants/states, event handlers, ref forwarding, className forwarding
- Follow TDD: write failing tests first, then implement to pass
- Use `screen.getByRole`, `screen.getByLabelText` etc. — prefer accessible queries
