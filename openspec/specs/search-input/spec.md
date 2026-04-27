## Requirements

### Requirement: SearchInput is a generic UI component with icon and rounded-xl shape
A `SearchInput` component SHALL exist at `components/ui/SearchInput/SearchInput.tsx` and be exported from `components/ui/index.ts`. It SHALL render a `div` wrapper containing a magnifying-glass `Icon` and an `<input>` element. The wrapper SHALL apply `flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3`. Clicking anywhere on the wrapper SHALL focus the `<input>`. The component SHALL spread all `InputHTMLAttributes<HTMLInputElement>` onto the `<input>` (enabling `value`, `onChange`, `placeholder`, `readOnly`, `aria-label`, etc.). A `className` prop SHALL be forwarded to the outer wrapper `div` via `cn()`. An optional `onClear` callback prop SHALL be accepted — when provided and `value` is non-empty, a clear (`xmark`) icon button SHALL appear at the right end; clicking it calls `onClear`.

#### Scenario: SearchInput renders icon and input
- **WHEN** `SearchInput` is rendered
- **THEN** a magnifying-glass icon and an `<input>` element are visible inside a rounded-xl container

#### Scenario: Clicking wrapper focuses the input
- **WHEN** the user clicks anywhere on the `SearchInput` wrapper
- **THEN** the `<input>` element receives focus

#### Scenario: Clicking the search icon focuses the input
- **WHEN** the user clicks the magnifying-glass icon
- **THEN** the `<input>` element receives focus

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

#### Scenario: Clear button appears when value is non-empty and onClear is provided
- **WHEN** `SearchInput` receives a non-empty `value` and an `onClear` handler
- **THEN** a clear button (xmark icon) is visible at the right end of the wrapper

#### Scenario: Clear button hidden when value is empty
- **WHEN** `SearchInput` receives an empty `value` string
- **THEN** no clear button is rendered

#### Scenario: Clicking clear button calls onClear
- **WHEN** the user clicks the clear button
- **THEN** `onClear` is called once

---

### Requirement: Home page uses SearchInput directly as a read-only placeholder
The home page SHALL render `SearchInput` with `readOnly` inside the `CollapsibleHeader` children slot. No `value`, `onChange`, or `onClear` props are wired — the search field is a non-interactive visual placeholder until the search feature is implemented. The placeholder text SHALL come from the `home` i18n namespace (`search.placeholder`).

#### Scenario: Home page search bar renders with magnifying-glass icon
- **WHEN** the home page renders
- **THEN** a `SearchInput` with a magnifying-glass icon is visible inside the collapsible header zone

#### Scenario: Home page search bar is not interactive
- **WHEN** the user taps or clicks the search bar on the home page
- **THEN** no keyboard appears and no navigation occurs (readOnly input)
