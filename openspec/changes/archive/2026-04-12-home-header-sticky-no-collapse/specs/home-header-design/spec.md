## ADDED Requirements

### Requirement: Home page AppHeader shows cart and notification icons
The home page AppHeader `right` slot SHALL contain a cart icon with a badge showing the current cart item count from `useCartStore`, and a notification bell icon with a static badge placeholder. Each icon SHALL be tappable (no-op navigation for now).

#### Scenario: Cart badge reflects cart item count
- **WHEN** the home page is rendered with items in the cart
- **THEN** the cart icon displays a badge with the cart item count

#### Scenario: Cart badge is hidden when cart is empty
- **WHEN** the home page is rendered with an empty cart
- **THEN** the cart icon displays no badge (or badge with 0 hidden)

#### Scenario: Notification icon is present
- **WHEN** the home page is rendered
- **THEN** a notification bell icon is visible to the right of the cart icon

---

### Requirement: Home page AppHeader title is centered
The AppHeader title on the home page SHALL be centered horizontally, with the back-button slot on the left (empty) and the action icons on the right.

#### Scenario: Title centered without back button
- **WHEN** AppHeader is rendered with no `onBack` prop
- **THEN** the title text is centered between the left placeholder slot and the right slot

---

### Requirement: CollapsibleHeader supports an optional decorative background element
`CollapsibleHeader` SHALL accept an optional `decoration` prop (ReactNode). When provided, it SHALL be rendered absolutely positioned inside the primary-colored background zone, behind all other content. When omitted, the background zone renders as a flat solid color.

#### Scenario: Decoration renders behind content
- **WHEN** CollapsibleHeader is rendered with a `decoration` prop
- **THEN** the decoration element is visible in the background of the topBar/children zone, not obscuring interactive elements

#### Scenario: No decoration prop renders clean background
- **WHEN** CollapsibleHeader is rendered without a `decoration` prop
- **THEN** the background zone shows a plain solid color with no extra elements

---

### Requirement: Home page CollapsibleHeader shows wave decoration background
On the home page, the `CollapsibleHeader` SHALL render a decorative wave SVG in the background zone, matching the approved `header.png` design.

#### Scenario: Wave decoration visible on home page
- **WHEN** the home page is rendered
- **THEN** the header background zone displays the wave SVG decoration

---

### Requirement: Home page wires scroll-driven collapse between ScrollablePage and CollapsibleHeader
`HomePage` SHALL hold `collapsed` state and a `scrollContainerRef`. `ScrollablePage` SHALL report `onCollapsedChange(scrollTop > 0)` to drive the state. `CollapsibleHeader` SHALL receive `collapsed` as a controlled prop and `scrollContainerRef` for proper IntersectionObserver root scoping.

#### Scenario: Card collapses on scroll down
- **WHEN** the user scrolls the home page content downward (scrollTop > 0)
- **THEN** `ScrollablePage` fires `onCollapsedChange(true)` → `collapsed` state becomes `true` → `CollapsibleHeader` passes `collapsed={true}` to `OutletContextCard`

#### Scenario: Card re-expands on scroll to top
- **WHEN** the user scrolls back to the top (scrollTop === 0)
- **THEN** `ScrollablePage` fires `onCollapsedChange(false)` → `collapsed` state becomes `false` → `CollapsibleHeader` passes `collapsed={false}` to `OutletContextCard`
