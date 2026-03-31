# Shared Components

App-specific shared components used across multiple pages or layouts. Unlike `ui/`, these components are allowed to reference app state (stores, hooks) directly.

## Components

| Component | Purpose |
|---|---|
| `BottomNav` | Fixed bottom navigation bar for authenticated pages — renders the 5 main routes using icons + i18n labels |
| `LanguageSwitcher` | Dropdown to switch i18n language (VI / EN). Reads `i18n.language`, calls `i18n.changeLanguage` |
| `ProtectedRoute` | Route guard: renders `null` while `!isReady`, redirects to `/login` if no user, renders outlet otherwise |
| `ThemeSwitcher` | Dropdown to switch theme preference (Light / System / Dark). Reads + writes `useThemeStore`. Pattern mirrors `LanguageSwitcher` |

## Dropdown Pattern (LanguageSwitcher / ThemeSwitcher)

Both dropdowns share the same structural pattern:

```
<div ref={ref} className="relative">
  <button onClick={toggle} …>  ← trigger
  {open && (
    <div className="absolute right-0 top-full …">  ← panel
      {options.map(…)}  ← option buttons
    </div>
  )}
</div>
```

- `useRef` + `mousedown` listener on `document` to close on outside click
- `useState` for open/closed state
- Active option: `text-primary font-medium`; inactive: `text-content dark:text-content-dark`
- All interactive elements are `<button type="button">` (never `<div>` or `<a>`)
- Panel uses `dark:bg-surface-dark dark:border-border-dark` for dark mode
