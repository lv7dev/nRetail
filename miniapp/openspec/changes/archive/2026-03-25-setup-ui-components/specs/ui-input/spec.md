## ADDED Requirements

### Requirement: Input renders a labeled text field
The `Input` component SHALL render an `<input>` element. When `label` prop is provided, it SHALL render an associated `<label>` linked via `htmlFor`/`id`.

#### Scenario: Label is associated with input
- **WHEN** `<Input label="Email" id="email" />` is rendered
- **THEN** a `<label>` with `for="email"` and an `<input id="email">` are present

#### Scenario: Input renders without label
- **WHEN** `<Input placeholder="Search..." />` is rendered without label
- **THEN** only the `<input>` element renders (no empty label)

### Requirement: Input displays error state
When `error` prop is provided, the `Input` component SHALL render with error border styling and display the error message below the input.

#### Scenario: Error message renders
- **WHEN** `<Input error="This field is required" />` is rendered
- **THEN** the text "This field is required" is visible in the DOM

#### Scenario: Error styles the input border
- **WHEN** `error` prop is set
- **THEN** the input has destructive border styling

### Requirement: Input forwards ref and HTML input props
The `Input` component SHALL use `React.forwardRef` and spread all standard HTML input attributes.

#### Scenario: ref points to input element
- **WHEN** a ref is passed to `<Input ref={ref} />`
- **THEN** `ref.current` is the underlying `<input>` DOM node
