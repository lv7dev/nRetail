## 1. Fix AppHeader title alignment

- [x] 1.1 Write failing test: AppHeader renders title centered when no `onBack` prop
- [x] 1.2 Remove `!onBack && 'text-left'` class from `AppHeader` title — always center

## 2. Add decoration prop to CollapsibleHeader

- [x] 2.1 Write failing test: CollapsibleHeader renders decoration node when `decoration` prop provided
- [x] 2.2 Write failing test: CollapsibleHeader renders clean background when no `decoration` prop
- [x] 2.3 Add `decoration?: ReactNode` prop to `CollapsibleHeader`; render it absolutely positioned inside the bg zone behind topBar/children

## 3. Add wave background SVG asset

- [x] 3.1 Add `wave-header.svg` to `miniapp/src/static/` matching the wave/swirl pattern from `header.png`

## 4. Cart and notification icons in home AppHeader

- [x] 4.1 Write failing test: home page AppHeader right slot contains cart icon with badge from `useCartStore`
- [x] 4.2 Write failing test: cart badge hidden when cart is empty
- [x] 4.3 Write failing test: notification bell icon is rendered
- [x] 4.4 Create a `HeaderActions` component (or inline node) in `src/pages/home/` that renders cart + notification icons with badges
- [x] 4.5 Pass the `HeaderActions` node to `AppHeader`'s `right` prop on the home page

## 5. Fix collapse wiring on home page

- [x] 5.1 Write failing test: OutletContextCard collapses when ScrollablePage reports scrolled state
- [x] 5.2 Add `collapsed` state + `scrollRef` to `HomePage`, wire `onCollapsedChange` from `ScrollablePage` to `CollapsibleHeader` controlled `collapsed` prop, share `scrollContainerRef`
- [x] 5.3 Fix `CollapsibleHeader` initial state: `useState(true)` → `useState(false)` so card starts expanded in uncontrolled mode
- [x] 5.4 Remove debug `console.log` from `CollapsibleHeader`

## 6. Wire wave decoration on home page

- [x] 6.1 Write failing test: home CollapsibleHeader renders wave decoration element
- [x] 6.2 Pass the wave SVG as the `decoration` prop to `CollapsibleHeader` in `HomePage`

## 7. Animate OutletContextCard collapse/expand

- [x] 7.1 Update test: OutletContextCard collapsed state checks `grid-template-rows: 0fr` instead of asserting actions not in DOM
- [x] 7.2 Replace conditional render (`{!collapsed && ...}`) with CSS `grid-template-rows` transition (`1fr` ↔ `0fr`, 200ms ease-in-out) + `overflow-hidden` wrapper
