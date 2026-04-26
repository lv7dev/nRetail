## 1. TabBar variant support

- [x] 1.1 Write failing tests for `TabBar` `variant="on-primary"`: active tab gets `bg-white text-primary`, inactive tabs get `bg-transparent text-white/80` with no border
- [x] 1.2 Add `variant?: 'default' | 'on-primary'` prop to `TabBarProps` and implement conditional class logic in `TabBar.tsx`
- [x] 1.3 Write failing test for `TabbedViewTabBar` forwarding `variant` prop to `TabBar`
- [x] 1.4 Add `variant` prop to `TabbedViewTabBarProps` and forward it in `TabbedViewTabBar.tsx`

## 2. OutletListPage layout restructure

- [x] 2.1 Write failing tests for the new DOM structure: `TabbedView.TabBar` inside the red zone (descendant of `CollapsibleHeader` children), search `Input` in the white zone above `TabbedView.Panels`
- [x] 2.2 Restructure `outlets/index.tsx`: wrap page with `<TabbedView>`, replace manual header div with `<CollapsibleHeader topBar={…}><TabbedView.TabBar variant="on-primary" /></CollapsibleHeader>`
- [x] 2.3 Move search `Input` into the white content zone div (below `CollapsibleHeader`, above `TabbedView.Panels`), outside any panel
- [x] 2.4 Replace the existing `TabbedView` subtree inside the white card with `<TabbedView.Panels mode="self">` directly inside the white zone div (remove the outer duplicate `<TabbedView>` wrapper and `px-4 TabBar` div)

## 3. Tests and documentation

- [x] 3.1 Run `npm run test` in `miniapp/` — fix any snapshot or structure assertions broken by the layout change
- [x] 3.2 Update `miniapp/src/pages/outlets/CLAUDE.md` layout diagram to reflect the new structure (CollapsibleHeader + TabbedView Mode 3)
