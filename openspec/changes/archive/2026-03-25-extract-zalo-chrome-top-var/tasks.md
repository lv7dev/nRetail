## 1. Define CSS variable

- [x] 1.1 In `src/css/app.css`: add `--zalo-chrome-top: calc(var(--zaui-safe-area-inset-top, 0px) + 1.6rem)` to the `:root` block (create the block if it doesn't exist)

## 2. Update AuthLayout

- [x] 2.1 In `src/components/AuthLayout.tsx`: replace inline style `top: "calc(var(--zaui-safe-area-inset-top, 0px) + 1.6rem)"` with `top: "var(--zalo-chrome-top)"`
