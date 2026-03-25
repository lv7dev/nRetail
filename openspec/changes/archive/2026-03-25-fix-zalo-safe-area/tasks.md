## 1. CSS Utilities

- [x] 1.1 Add `.pt-safe` utility class to `src/css/app.css`: `padding-top: var(--zaui-safe-area-top, 0px)`
- [x] 1.2 Add `.pb-safe` utility class to `src/css/app.css`: `padding-bottom: var(--zaui-safe-area-bottom, 0px)`

## 2. AuthLayout

- [x] 2.1 Update `AuthLayout.tsx` LanguageSwitcher wrapper: replace `top-4` with inline style `top: calc(var(--zaui-safe-area-top, 0px) + 1rem)`

## 3. AppLayout

- [x] 3.1 Update `AppLayout.tsx` page content wrapper: add `.pt-safe` class (or inline style `padding-top: var(--zaui-safe-area-top, 0px)`) to the `page-content` div

## 4. BottomNav

- [x] 4.1 Update `BottomNav.tsx`: replace fixed `bottom-0` with inline style `bottom: var(--zaui-safe-area-bottom, 0px)` so it clears the home indicator / Android nav bar
