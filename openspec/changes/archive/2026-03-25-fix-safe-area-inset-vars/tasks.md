## 1. Fix CSS utility classes

- [x] 1.1 In `src/css/app.css`: rename `--zaui-safe-area-top` → `--zaui-safe-area-inset-top` in `.pt-safe`
- [x] 1.2 In `src/css/app.css`: rename `--zaui-safe-area-bottom` → `--zaui-safe-area-inset-bottom` in `.pb-safe`

## 2. Fix AuthLayout

- [x] 2.1 In `src/components/AuthLayout.tsx`: update inline style to use `--zaui-safe-area-inset-top` instead of `--zaui-safe-area-top`

## 3. Fix BottomNav

- [x] 3.1 In `src/components/shared/BottomNav.tsx`: update inline style to use `--zaui-safe-area-inset-bottom` instead of `--zaui-safe-area-bottom`

## 4. Fix app-config.json

- [x] 4.1 In `app-config.json`: change `hideIOSSafeAreaBottom` from `true` to `false`
