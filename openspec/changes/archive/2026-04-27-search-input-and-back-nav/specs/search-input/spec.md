## ADDED Requirements

### Requirement: SearchInput is a generic UI component with icon and rounded-xl shape
A `SearchInput` component SHALL exist at `components/ui/SearchInput/SearchInput.tsx` and be exported from `components/ui/index.ts`. It SHALL render a `div` wrapper containing a magnifying-glass `Icon` and an `<input>` element. The wrapper SHALL apply `flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3`. The component SHALL spread all `InputHTMLAttributes<HTMLInputElement>` onto the `<input>` (enabling `value`, `onChange`, `placeholder`, `readOnly`, `aria-label`, etc.). A `className` prop SHALL be forwarded to the outer wrapper `div` via `cn()`.

#### Scenario: SearchInput renders icon and input
- **WHEN** `SearchInput` is rendered
- **THEN** a magnifying-glass icon and an `<input>` element are visible inside a rounded-xl container

#### Scenario: SearchInput forwards value and onChange
- **WHEN** `SearchInput` receives `value="foo"` and an `onChange` handler
- **THEN** the `<input>` element has `value="foo"` and fires `onChange` when the user types

#### Scenario: SearchInput forwards placeholder
- **WHEN** `SearchInput` receives a `placeholder` prop
- **THEN** the `<input>` element renders that placeholder

#### Scenario: SearchInput className is applied to the wrapper
- **WHEN** `SearchInput` receives `className="mt-2"`
- **THEN** `mt-2` is present on the outer wrapper `div`, not on the `<input>`

#### Scenario: SearchInput readOnly prevents editing
- **WHEN** `SearchInput` receives `readOnly`
- **THEN** the `<input>` element has the `readOnly` attribute

---

### Requirement: Home page SearchBar uses SearchInput for visual consistency
The home page `SearchBar` component SHALL use `SearchInput` internally instead of a hand-crafted `div`. It SHALL pass `readOnly` (no interactivity until search is implemented) and the i18n placeholder from the `home` namespace. The `SearchBar` wrapper retains its `px-4 pb-3` spacing as before.

#### Scenario: SearchBar renders with magnifying-glass icon
- **WHEN** `SearchBar` renders on the home page
- **THEN** a magnifying-glass icon is visible to the left of the placeholder text

#### Scenario: SearchBar is not interactive
- **WHEN** the user taps or clicks the SearchBar on the home page
- **THEN** no keyboard appears and no navigation occurs (readOnly input)
