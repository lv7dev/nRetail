## 1. Infrastructure & Tooling

- [x] 1.1 Move `src/static/fontawesome-pro-6.1.0-desktop/svgs/` → `src/assets/icons/` (solid, regular, light, thin, brands subfolders only; discard otfs and metadata)
- [x] 1.2 Add `clsx` and `tailwind-merge` to dependencies (`npm install clsx tailwind-merge`)
- [x] 1.3 Add `vite-plugin-svgr` to devDependencies (`npm install -D vite-plugin-svgr`)
- [x] 1.4 Update `vite.config.mts` to register `svgr()` plugin
- [x] 1.5 Add svgr type declarations: create `src/vite-env-svgr.d.ts` declaring `*.svg?react` module type

## 2. Design Tokens & Dark Mode

- [x] 2.1 Update `tailwind.config.js`: change `darkMode` from `["selector", '[zaui-theme="dark"]']` to `"class"`
- [x] 2.2 Add semantic color tokens to `tailwind.config.js` `theme.extend.colors`: primary, surface, border, content, destructive, success

## 3. cn() Utility

- [x] 3.1 Create `src/utils/cn.ts` with `cn()` helper using clsx + tailwind-merge
- [x] 3.2 Write unit test `src/utils/cn.test.ts` verifying class merging and conflict resolution

## 4. Component Conventions (CLAUDE.md)

- [x] 4.1 Create `src/components/CLAUDE.md` documenting: folder structure, props rules (className, forwardRef, interface naming), styling rules (cn(), design tokens, no inline styles), icon rules, testing rules

## 5. Button Component

- [x] 5.1 Write failing tests `src/components/ui/Button/Button.test.tsx` covering: renders, all variants, all sizes, disabled state, className forwarding, onClick
- [x] 5.2 Implement `src/components/ui/Button/Button.tsx` to pass tests
- [x] 5.3 Create `src/components/ui/Button/index.ts` barrel export

## 6. Icon Component

- [x] 6.1 Write failing tests `src/components/ui/Icon/Icon.test.tsx` covering: renders SVG, default variant, size prop, className forwarding
- [x] 6.2 Implement `src/components/ui/Icon/Icon.tsx` using dynamic svgr import
- [x] 6.3 Create `src/components/ui/Icon/index.ts` barrel export

## 7. Input Component

- [x] 7.1 Write failing tests `src/components/ui/Input/Input.test.tsx` covering: renders, label association, error message, error styles, ref forwarding, disabled state
- [x] 7.2 Implement `src/components/ui/Input/Input.tsx` to pass tests
- [x] 7.3 Create `src/components/ui/Input/index.ts` barrel export

## 8. Checkbox Component

- [x] 8.1 Write failing tests `src/components/ui/Checkbox/Checkbox.test.tsx` covering: renders, label association, checked state, onChange fires, disabled state, ref forwarding
- [x] 8.2 Implement `src/components/ui/Checkbox/Checkbox.tsx` to pass tests
- [x] 8.3 Create `src/components/ui/Checkbox/index.ts` barrel export

## 9. Barrel & Integration

- [x] 9.1 Update `src/components/ui/index.ts` to re-export Button, Icon, Input, Checkbox
- [x] 9.2 Update `src/components/shared/BottomNav.tsx` to replace emoji icons with `<Icon>` component
- [x] 9.3 Run full test suite (`npm run test`) — all tests must pass
