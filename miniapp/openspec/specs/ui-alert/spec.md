## ADDED Requirements

### Requirement: Alert renders a message with a variant style
`Alert` SHALL accept a `message: string` prop and a `variant` prop (`"error"` | `"success"` | `"info"`, default `"error"`). Each variant SHALL use distinct background and text colors derived from design tokens.

#### Scenario: Error variant renders with destructive colors
- **WHEN** `<Alert variant="error" message="Invalid phone" />` is rendered
- **THEN** the element has destructive background/text styling and the text "Invalid phone" is visible

#### Scenario: Success variant renders with success colors
- **WHEN** `<Alert variant="success" message="Code sent" />` is rendered
- **THEN** the element has success background/text styling

#### Scenario: Default variant is error
- **WHEN** `<Alert message="Oops" />` is rendered without a variant prop
- **THEN** the element uses error styling

### Requirement: Alert renders nothing when message is empty
When `message` is an empty string or undefined, `Alert` SHALL render nothing (return `null`).

#### Scenario: Empty message renders nothing
- **WHEN** `<Alert message="" />` is rendered
- **THEN** no element is present in the DOM

### Requirement: Alert forwards className
`Alert` SHALL accept `className` and merge it via `cn()`.

#### Scenario: Custom className is applied
- **WHEN** `<Alert message="Err" className="mt-2" />` is rendered
- **THEN** the container has the `mt-2` class
