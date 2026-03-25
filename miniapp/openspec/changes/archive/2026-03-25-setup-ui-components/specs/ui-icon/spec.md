## ADDED Requirements

### Requirement: Icon renders the correct FA6 Pro SVG
The `Icon` component SHALL accept `name` (icon file name without extension) and `variant` (`solid` | `regular` | `light` | `thin` | `brands`, default `regular`) and render the corresponding SVG from `src/assets/icons/<variant>/<name>.svg`.

#### Scenario: Solid house icon renders
- **WHEN** `<Icon name="house" variant="solid" />` is rendered
- **THEN** an SVG element is present in the DOM

#### Scenario: Default variant is regular
- **WHEN** `<Icon name="house" />` is rendered without variant
- **THEN** it uses the `regular` style SVG

### Requirement: Icon inherits color via currentColor
Icon SVGs SHALL use `fill="currentColor"` so the icon color is controlled by the CSS `color` property (Tailwind `text-*` classes).

#### Scenario: Icon color follows text color
- **WHEN** `<Icon name="house" className="text-primary" />` is rendered
- **THEN** the SVG fill matches the primary color

### Requirement: Icon accepts a size prop
The `Icon` component SHALL accept a `size` prop (number, default `16`) that sets both `width` and `height` on the SVG.

#### Scenario: Custom size is applied
- **WHEN** `<Icon name="house" size={24} />` is rendered
- **THEN** the SVG has `width="24"` and `height="24"`
