## ADDED Requirements

### Requirement: Button renders with variant styles
The `Button` component SHALL support `variant` prop with values: `primary` (default), `secondary`, `ghost`, `destructive`. Each variant SHALL have visually distinct background, text, and border styles using design tokens.

#### Scenario: Primary variant is default
- **WHEN** `<Button>Click</Button>` is rendered without a variant prop
- **THEN** it renders with primary background (`bg-primary`) and white text

#### Scenario: Destructive variant renders red
- **WHEN** `<Button variant="destructive">Delete</Button>` is rendered
- **THEN** it renders with destructive background and white text

#### Scenario: Ghost variant is transparent
- **WHEN** `<Button variant="ghost">Cancel</Button>` is rendered
- **THEN** it renders with no background and content-colored text

### Requirement: Button renders with size styles
The `Button` component SHALL support `size` prop with values: `sm`, `md` (default), `lg`. Each size SHALL have distinct padding and font size.

#### Scenario: Default size is md
- **WHEN** `<Button>Click</Button>` is rendered without a size prop
- **THEN** it renders with medium padding and font size

### Requirement: Button handles disabled state
The `Button` component SHALL visually indicate and functionally disable when `disabled` prop is true.

#### Scenario: Disabled button is not clickable
- **WHEN** `<Button disabled onClick={handler}>Click</Button>` is rendered and clicked
- **THEN** `handler` is NOT called and the button appears visually muted

### Requirement: Button forwards className and HTML button props
The `Button` component SHALL spread all standard HTML button attributes and merge `className` via `cn()`.

#### Scenario: onClick handler is called
- **WHEN** `<Button onClick={handler}>Click</Button>` is clicked
- **THEN** `handler` is called once
