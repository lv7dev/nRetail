## 1. TabBar UI component

- [x] 1.1 Write failing tests for `TabBar`: renders N buttons, active/inactive styles, `onChange` fires with correct key, `className` forwarding
- [x] 1.2 Implement `TabBar` at `components/ui/TabBar/TabBar.tsx` — `overflow-x: auto`, `flex` container, each button `flex-1 min-w-max whitespace-nowrap py-2 text-sm rounded-lg`
- [x] 1.3 Add `components/ui/TabBar/index.ts` barrel export and register in `components/ui/index.ts`
- [x] 1.4 Write failing test: long tab label stays single-line, no wrapping
- [x] 1.5 Verify all TabBar tests pass

## 2. TabbedView context and root

- [x] 2.1 Write failing tests for `TabbedView`: context provides `activeTab` + `onTabChange`, supports controlled mode via props
- [x] 2.2 Implement `TabbedViewContext` (internal) and `TabbedView` root component at `components/shared/TabbedView/TabbedView.tsx` — manages `activeTab` state, accepts optional `tabs`, `defaultTab`, `activeTab`, `onTabChange` props
- [x] 2.3 Write failing tests for `TabbedView.TabBar`: reads context, clicking tab calls `onTabChange` with correct key
- [x] 2.4 Implement `TabbedViewTabBar` at `components/shared/TabbedView/TabbedViewTabBar.tsx` — wraps `TabBar`, forwards `className`

## 3. TabbedView.Panel — display:none mount strategy

- [x] 3.1 Write failing tests for panel visibility: inactive panel has `display: none`, active panel has no display override, all panels stay mounted after tab switches
- [x] 3.2 Implement `TabbedViewPanel` at `components/shared/TabbedView/TabbedViewPanel.tsx` — renders with `style={{ display: 'none' }}` when `tabKey !== activeTab`, plain `<div>` wrapper
- [x] 3.3 Verify scroll position is preserved across tab switches in self-scroll mode (panel never unmounts)

## 4. Self-scroll mode

- [x] 4.1 Write failing tests for `TabbedView.Panels mode="self"`: panel contains a `ScrollablePage`, `onRefresh`/`onLoadMore`/`hasMore` forwarded correctly
- [x] 4.2 Implement `TabbedViewPanels` at `components/shared/TabbedView/TabbedViewPanels.tsx` — accepts `mode`, renders children via `TabbedViewPanel` wrappers; in `mode="self"`, wrap each child's `ScrollablePage` inside the panel
- [x] 4.3 Write failing test: self-scroll mode — `onRefresh` prop forwarded to `ScrollablePage`

## 5. Outer-scroll mode — scroll save/restore

- [x] 5.1 Write failing tests: switching tabs saves `outerScrollRef.current.scrollTop` for the outgoing tab
- [x] 5.2 Write failing tests: returning to a visited tab restores its saved `scrollTop`
- [x] 5.3 Write failing tests: first visit to a tab scrolls to `tabbedViewPanelsRef.current.offsetTop`
- [x] 5.4 Implement outer-scroll logic in `TabbedViewPanels`: `scrollPositions` ref map (`Map<string, number>`), save on switch-away, restore/offsetTop on switch-to
- [x] 5.5 Verify outer mode panels have no `ScrollablePage` inside (plain `<div>` only)

## 6. Barrel exports and file cleanup

- [x] 6.1 Add `components/shared/TabbedView/index.ts` — export `TabbedView`, attach `.TabBar` and `.Panels` as static properties; export `TabbedViewPanel` as `TabbedView.Panel`
- [x] 6.2 Register `TabbedView` in `components/shared/index.ts`

## 7. Replace home page TabbedProductSection

- [x] 7.1 Write failing tests for home page integration: `TabbedView` renders in outer-scroll mode, bought/viewed tabs switch correctly, TabBar is sticky
- [x] 7.2 Update `pages/home/index.tsx` — replace `<TabbedProductSection>` with `TabbedView` in outer-scroll mode; add sticky `className` to `TabbedView.TabBar`; wire `outerScrollRef` from existing `scrollRef`
- [x] 7.3 Delete `pages/home/TabbedProductSection.tsx` and `pages/home/TabbedProductSection.test.tsx`
- [x] 7.4 Update `pages/home/CLAUDE.md` to reflect new file structure and component contracts
- [x] 7.5 Run full test suite — `npm run test` and `npm run test:integration` in `miniapp/`
