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
- No inline `style` props unless the value cannot be expressed in Tailwind (e.g., dynamic pixel values, CSS custom properties like `var(--zalo-chrome-top)` or `var(--zaui-safe-area-inset-bottom)`). **Important:** never use Tailwind arbitrary values like `` `pb-[${n}px]` `` for runtime-dynamic values — they are purged by Tailwind JIT in production. Use `style={{ paddingBottom: `${n}px` }}` instead.
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

## SearchInput

Generic search field — rounded-xl wrapper with a leading magnifying-glass icon and a real `<input>`. Clicking anywhere on the wrapper (including padding/dead space) focuses the input.

```tsx
<SearchInput
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onClear={() => setSearchTerm('')}
  placeholder={t('search.placeholder')}
  aria-label={t('search.placeholder')}
/>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Controlled value |
| `onChange` | `ChangeEventHandler` | Standard input onChange |
| `onClear` | `() => void` | Optional — when provided and `value` is non-empty, shows an `xmark` icon button that calls this on click |
| `placeholder` | `string` | Input placeholder |
| `readOnly` | `boolean` | Prevents editing (home page placeholder usage) |
| `className` | `string` | Applied to the outer wrapper `div`, not the `<input>` |

**Behaviours:**
- Wrapper `onClick` → `inputRef.current?.focus()` — clicking anywhere in the container focuses the input
- Clear button (`xmark`) appears only when `value` is non-empty AND `onClear` is provided; hidden when `readOnly` (since `onClear` is never passed in that case)
- `forwardRef` is supported — external ref merges with the internal focus ref

**Home page usage:** rendered with `readOnly` and no `onClear` — purely a visual placeholder until the search feature is implemented.

**Outlet page usage:** rendered with `value`, `onChange`, and `onClear` — fully interactive, drives debounced server-side search.

## TabBar

Generic horizontally-scrollable tab row. Used by `TabbedView.TabBar` but also consumable standalone.

```tsx
<TabBar
  tabs={[{ key: 'a', label: 'Tab A' }, { key: 'b', label: 'Tab B' }]}
  activeTab="a"
  onChange={(key) => setActive(key)}
  className="sticky top-0 z-10 bg-surface"
/>
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `tabs` | `Tab[]` | `{ key: string, label: string }[]` — tab definitions |
| `activeTab` | `string` | Key of the currently active tab |
| `onChange` | `(key: string) => void` | Called when a tab is clicked |
| `variant` | `'default' \| 'on-primary'` | Colour scheme. `default` (light surface): active `bg-primary text-content-inverse`, inactive `border border-border text-content-muted`. `on-primary` (red/primary bg): active `bg-white text-primary`, inactive `border border-white/50 text-white/80`. Defaults to `'default'`. |
| `className` | `string` | Forwarded to the root wrapper via `cn()` |

**Layout:** `flex gap-3 overflow-x-auto`. Each tab is `flex-1 min-w-max whitespace-nowrap` so tabs share space evenly but never wrap. Colours are controlled by `variant` (see above).

**Accessibility:** Each tab renders as `<button type="button" aria-pressed={isActive}>`.

**`Tab` type** is exported from `@/components/ui` for use in page-level state:
```ts
import type { Tab } from '@/components/ui';
```

## Testing Rules

- Tests are co-located as `<ComponentName>.test.tsx` in the same folder
- Use Vitest + React Testing Library
- Test: renders, all variants/states, event handlers, ref forwarding, className forwarding
- Follow TDD: write failing tests first, then implement to pass
- Use `screen.getByRole`, `screen.getByLabelText` etc. — prefer accessible queries
