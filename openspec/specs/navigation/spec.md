## ADDED Requirements

### Requirement: Bottom-tab navigation shell
The app SHALL render a persistent bottom navigation bar with five tabs: Home, Products, Cart, Orders, and Profile. Each tab SHALL route to its corresponding page without a full app reload. Navigation SHALL be implemented using React Router (`BrowserRouter` + `Routes` + `Route`).

#### Scenario: User taps a tab
- **WHEN** the user taps any bottom tab
- **THEN** the corresponding page SHALL be displayed

#### Scenario: Active tab is highlighted
- **WHEN** a tab's page is the current route
- **THEN** that tab's icon and label SHALL be visually distinct from inactive tabs

#### Scenario: App launches to Home tab
- **WHEN** the mini app first opens
- **THEN** the Home tab SHALL be selected and the Home page SHALL be displayed

---

### Requirement: Route definitions for all main sections
The app SHALL define routes for `/`, `/products`, `/cart`, `/orders`, and `/profile`. Each route SHALL render a corresponding stub page component.

#### Scenario: Direct navigation to a route
- **WHEN** React Router navigates to `/products`
- **THEN** the Products page component SHALL render within the app shell

#### Scenario: Unknown routes
- **WHEN** the router receives an unrecognized path
- **THEN** the app SHALL fall back to the Home page (route `/`)

---

### Requirement: Page stub components for all main sections
Each main section (Home, Products, Cart, Orders, Profile) SHALL have a stub page component that renders a visible placeholder indicating the page name.

#### Scenario: Stub page is visible
- **WHEN** a stub page route is active
- **THEN** the page SHALL display the section name so developers can confirm routing works

---

### Requirement: Cart badge on Cart tab
The Cart tab SHALL display a badge with the current cart item count when the count is greater than zero, reading from `src/store/useCartStore.ts`.

#### Scenario: Cart has items
- **WHEN** the cart store contains one or more items
- **THEN** the Cart tab SHALL display the count as a badge

#### Scenario: Cart is empty
- **WHEN** the cart store count is zero
- **THEN** no badge SHALL be shown on the Cart tab
