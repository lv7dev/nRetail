## 1. BottomNav ResizeObserver

- [x] 1.1 Write failing test: BottomNav sets `--bottom-nav-height` on mount via ResizeObserver (mock `vi.stubGlobal('ResizeObserver', ...)` in jsdom)
- [x] 1.2 Write failing test: BottomNav disconnects ResizeObserver on unmount
- [x] 1.3 Add `ref` to the `<nav>` element in `BottomNav.tsx`
- [x] 1.4 Add `useEffect` that creates a `ResizeObserver`, observes the ref, writes `--bottom-nav-height` to `document.documentElement`, and disconnects on cleanup

## 2. AppLayout Scroll Clearance

- [x] 2.1 Write failing test: `page-content` div has `paddingBottom` style containing `--bottom-nav-height`
- [x] 2.2 Add `paddingBottom: 'calc(var(--bottom-nav-height, 3.5rem) + var(--zaui-safe-area-inset-bottom, 0px))'` style to the `page-content` div in `AppLayout.tsx`

## 3. Remove Switchers from AppLayout

- [x] 3.1 Update `AppLayout.test.tsx`: remove any assertions checking for ThemeSwitcher or LanguageSwitcher presence; add assertion that they are absent
- [x] 3.2 Remove `ThemeSwitcher`, `LanguageSwitcher` imports and their JSX from `AppLayout.tsx`
- [x] 3.3 Remove the empty `<div className="flex items-center gap-1 ml-auto">` wrapper from the header row
