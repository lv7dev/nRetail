## 1. Icon Component

- [ ] 1.1 Write failing test: Icon renders with `fill="currentColor"` on the SVG root element
- [ ] 1.2 Add `fill="currentColor"` prop to the `<SvgIcon>` render in `Icon.tsx`
- [ ] 1.3 Verify test passes and all existing Icon tests remain green

## 2. BottomNav

- [ ] 2.1 Write failing test: active tab button has `text-primary` class, inactive has `text-content-muted` and `dark:text-content-dark-muted`
- [ ] 2.2 Write failing test: no `style` attribute with `color` property on tab buttons
- [ ] 2.3 Replace inline `style={{ color: ... }}` with conditional Tailwind classes (`text-primary` active, `text-content-muted dark:text-content-dark-muted` inactive)
- [ ] 2.4 Verify all BottomNav tests pass
