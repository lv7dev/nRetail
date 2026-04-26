## Requirements

### Requirement: TabBar renders one button per tab entry
`TabBar` SHALL render exactly one `<button>` element for each entry in the `tabs` prop array. Each button displays the tab's `label` string.

#### Scenario: Renders correct number of tabs
- **WHEN** `TabBar` is rendered with `tabs` containing N entries
- **THEN** exactly N `<button>` elements are rendered

#### Scenario: Each button shows its label
- **WHEN** `TabBar` is rendered with a tab entry `{ key: 'bought', label: 'Đã mua' }`
- **THEN** a button with text `'Đã mua'` is present in the DOM

---

### Requirement: Active tab has a distinct visual state
`TabBar` SHALL apply active styling to the button whose `key` matches the `activeTab` prop, and inactive styling to all others. Active: `bg-primary text-content-inverse`. Inactive: `border border-border text-content-muted`.

#### Scenario: Active tab is styled
- **WHEN** `activeTab` is `'bought'`
- **THEN** the `'bought'` button has the active CSS classes applied

#### Scenario: Inactive tabs are styled
- **WHEN** `activeTab` is `'bought'`
- **THEN** all other tab buttons have the inactive CSS classes applied

---

### Requirement: Tab buttons call onChange on click
`TabBar` SHALL call the `onChange` callback with the tab's `key` when a tab button is clicked.

#### Scenario: Clicking a tab fires onChange
- **WHEN** the user clicks the button for tab `{ key: 'viewed', label: '...' }`
- **THEN** `onChange` is called with `'viewed'`

#### Scenario: Clicking the already active tab still fires onChange
- **WHEN** `activeTab` is `'bought'` and the user clicks the `'bought'` button
- **THEN** `onChange` is called with `'bought'`

---

### Requirement: Each tab button is flex-1 with no text wrapping
Each tab button SHALL have `flex: 1` sizing and `whitespace-nowrap` so its label never wraps to a second line.

#### Scenario: Tab label stays on one line
- **WHEN** a tab label is a long string (e.g., `'Sản phẩm đã mua gần đây'`)
- **THEN** the button text renders on a single line without wrapping

---

### Requirement: TabBar scrolls horizontally when tabs overflow
The `TabBar` container SHALL use `overflow-x: auto` so that when the total tab width exceeds the container width, the user can scroll horizontally to reveal hidden tabs. Each tab button SHALL have `min-w-max` to prevent shrinking below its natural content width.

#### Scenario: Overflow activates horizontal scroll
- **WHEN** there are many tabs whose total min-width exceeds the container width
- **THEN** the TabBar container is horizontally scrollable

#### Scenario: Tabs do not shrink below content width
- **WHEN** the tab container is narrow
- **THEN** each tab button maintains at least its natural content width (`min-w-max`) and does not compress its label

---

### Requirement: TabBar accepts className for external styling
`TabBar` SHALL accept an optional `className` prop and merge it onto the root element via `cn()`, allowing callers to apply sticky positioning, background, padding, or z-index without modifying the component.

#### Scenario: className is applied to root
- **WHEN** `TabBar` is rendered with `className="sticky top-0 bg-surface"`
- **THEN** the root element has those classes

---

### Requirement: TabBar supports an on-primary variant for use on coloured backgrounds
`TabBar` SHALL accept an optional `variant` prop with values `"default"` (existing behaviour) and `"on-primary"`. When `variant="on-primary"`, active tab styling SHALL be `bg-white text-primary` and inactive tab styling SHALL be `border border-white/50 text-white/80`. When `variant` is omitted or `"default"`, existing styling applies unchanged.

#### Scenario: on-primary active tab has white background and primary text
- **WHEN** `TabBar` is rendered with `variant="on-primary"` and `activeTab="connected"`
- **THEN** the "connected" button has `bg-white` and `text-primary` classes applied

#### Scenario: on-primary inactive tabs have a white border and white text
- **WHEN** `TabBar` is rendered with `variant="on-primary"` and `activeTab="connected"`
- **THEN** all non-active buttons have `border border-white/50` and `text-white/80` classes applied

#### Scenario: default variant is unaffected
- **WHEN** `TabBar` is rendered without a `variant` prop (or with `variant="default"`)
- **THEN** active tab has `bg-primary text-content-inverse` and inactive tabs have `border border-border text-content-muted` (existing behaviour unchanged)

---

### Requirement: TabbedViewTabBar forwards variant to TabBar
`TabbedViewTabBar` SHALL accept an optional `variant` prop and forward it to the underlying `TabBar` component.

#### Scenario: variant prop is forwarded
- **WHEN** `TabbedView.TabBar` is rendered with `variant="on-primary"`
- **THEN** the underlying `TabBar` receives `variant="on-primary"` and renders on-primary styling
