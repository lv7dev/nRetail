## ADDED Requirements

### Requirement: Each UI component lives in its own folder
Every component under `src/components/ui/` SHALL follow the folder structure: `ui/<ComponentName>/` containing `<ComponentName>.tsx`, `<ComponentName>.test.tsx`, and `index.ts`.

#### Scenario: Component folder structure
- **WHEN** a new component `Foo` is created
- **THEN** files exist at `ui/Foo/Foo.tsx`, `ui/Foo/Foo.test.tsx`, `ui/Foo/index.ts`

### Requirement: Components accept and forward className
Every UI component SHALL accept `className?: string` and merge it via `cn()` so consumers can extend styles.

#### Scenario: Custom className is applied
- **WHEN** a component is rendered with `className="mt-4"`
- **THEN** the rendered element includes the `mt-4` class alongside default classes

### Requirement: Form elements use forwardRef
Input, Checkbox, and other form elements SHALL use `React.forwardRef` to expose the underlying DOM element ref.

#### Scenario: ref is forwarded to input
- **WHEN** a ref is passed to `<Input ref={ref} />`
- **THEN** `ref.current` points to the underlying `<input>` DOM element

### Requirement: cn() utility is used for all class merging
Components SHALL use the `cn()` utility (`clsx` + `tailwind-merge`) for all conditional and merged class names. Inline `style` props SHALL only be used for values not expressible in Tailwind.

#### Scenario: Conflicting classes resolve correctly
- **WHEN** `cn('px-4', 'px-6')` is called
- **THEN** the result is `'px-6'` (tailwind-merge resolves conflict)
