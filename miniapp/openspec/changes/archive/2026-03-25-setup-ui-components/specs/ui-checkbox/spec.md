## ADDED Requirements

### Requirement: Checkbox renders with a label
The `Checkbox` component SHALL render a `<input type="checkbox">` with an associated `<label>` when `label` prop is provided, linked via `htmlFor`/`id`.

#### Scenario: Label is associated with checkbox
- **WHEN** `<Checkbox label="Accept terms" id="terms" />` is rendered
- **THEN** a `<label for="terms">` and `<input type="checkbox" id="terms">` are present

### Requirement: Checkbox reflects checked state
The `Checkbox` component SHALL accept `checked` and `onChange` props and reflect the controlled checked state.

#### Scenario: Checked state is reflected
- **WHEN** `<Checkbox checked={true} onChange={() => {}} />` is rendered
- **THEN** the checkbox input is checked

#### Scenario: onChange fires on click
- **WHEN** the checkbox is clicked
- **THEN** `onChange` is called with the change event

### Requirement: Checkbox handles disabled state
When `disabled` prop is true, the `Checkbox` SHALL be visually muted and non-interactive.

#### Scenario: Disabled checkbox is not interactive
- **WHEN** `<Checkbox disabled checked={false} onChange={handler} />` is clicked
- **THEN** `handler` is NOT called

### Requirement: Checkbox forwards ref
The `Checkbox` component SHALL use `React.forwardRef` to expose the underlying `<input>` DOM element.

#### Scenario: ref points to input element
- **WHEN** a ref is passed to `<Checkbox ref={ref} />`
- **THEN** `ref.current` is the underlying `<input type="checkbox">` DOM node
