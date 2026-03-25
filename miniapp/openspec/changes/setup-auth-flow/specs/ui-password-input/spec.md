## ADDED Requirements

### Requirement: PasswordInput renders a password field with a toggle button
`PasswordInput` SHALL render an `<input type="password">` by default, with an icon button inside the field to toggle visibility. It SHALL accept all props that `Input` accepts (label, error, className, ref, etc.).

#### Scenario: Password is hidden by default
- **WHEN** `<PasswordInput />` is rendered
- **THEN** the input has `type="password"` and content is masked

#### Scenario: Toggle reveals the password
- **WHEN** the user clicks the toggle button
- **THEN** the input changes to `type="text"` and content is visible

#### Scenario: Toggle hides the password again
- **WHEN** the input is visible and the user clicks the toggle button again
- **THEN** the input returns to `type="password"`

### Requirement: PasswordInput shows an eye icon matching visibility state
The toggle button SHALL display `<Icon name="eye-slash" />` when the password is hidden and `<Icon name="eye" />` when it is visible.

#### Scenario: eye-slash icon shows when password is hidden
- **WHEN** the password is masked
- **THEN** the eye-slash icon is rendered in the toggle button

#### Scenario: eye icon shows when password is visible
- **WHEN** the password is revealed
- **THEN** the eye icon is rendered in the toggle button

### Requirement: PasswordInput forwards ref to the underlying input element
`PasswordInput` SHALL use `React.forwardRef` so `ref.current` points to the underlying `<input>` DOM node.

#### Scenario: ref points to input element
- **WHEN** a ref is passed to `<PasswordInput ref={ref} />`
- **THEN** `ref.current` is an `HTMLInputElement`
