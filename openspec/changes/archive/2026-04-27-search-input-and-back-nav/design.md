## Context

Two independent UI problems on the outlet list page:

1. **Search shape mismatch**: The home page renders a custom `SearchBar` (a decorative `div` with a magnifying-glass icon and a `span`) while the outlet list page uses the generic `Input` component with `border-0 bg-white` overrides. They look different: `rounded-xl` vs `rounded-md`, icon vs no icon, different backgrounds.

2. **False-positive back arrow**: `OutletListPage` shows the back arrow when `location.key !== 'default'`. This check is meant to detect "navigated here from another page", but it breaks because `OutletGuard` redirects to `/outlets` via `<Navigate replace />`, which assigns a fresh key (`window.history.replaceState({ key: uuid })`). After that redirect, `location.key` is no longer `'default'`, so `canGoBack` is incorrectly `true` — the back arrow appears but pressing it either exits the app or does nothing.

## Goals / Non-Goals

**Goals:**
- Single `SearchInput` UI component that both pages use, with consistent shape (`rounded-xl`, magnifying-glass icon)
- Back arrow on outlet list page visible only when the user genuinely can go back to a previous page in the app

**Non-Goals:**
- Making the home page search functional (it stays a visual placeholder)
- Changing search behavior, debounce logic, or query wiring in the outlet page
- Handling future deep-link or share-URL scenarios for `/outlets`

## Decisions

### 1. `SearchInput` goes in `components/ui/`

The component has no app-specific logic — it is a generic icon-prefixed input with consistent shape. This is the same category as `OtpInput` and `PasswordInput`. It spreads `InputHTMLAttributes<HTMLInputElement>` for full native compatibility. `className` is forwarded to the outer wrapper div (not the `<input>`) so callers can control spacing.

**Alternative considered:** `components/shared/` — rejected because the component has no dependency on app state, stores, or i18n.

### 2. Home `SearchBar` uses `SearchInput` as a read-only placeholder

The home page `SearchBar` wraps `SearchInput` with `readOnly` so the input does not receive keyboard events. No `value`/`onChange` props are wired. The visual shape is unified; the search feature itself is a separate future change.

**Alternative considered:** Remove `SearchBar` and put `SearchInput` inline in `HomePage` — rejected because `SearchBar.tsx` already exists as the home-specific wrapper and keeps page-level padding (`px-4 pb-3`) encapsulated there.

### 3. Back arrow detection uses explicit router state (`location.state?.canGoBack`)

`OutletContextCard` passes `{ state: { canGoBack: true } }` when pushing to `/outlets`. `OutletListPage` reads `!!location.state?.canGoBack`. This is opt-in: only intentional pushes from within the app carry the flag. `OutletGuard`'s `<Navigate replace />` never sets it, so the first-boot redirect never shows the back arrow.

**Alternative considered:** `useNavigationType() === 'PUSH'` — this would show back arrow on any push navigation, including hypothetical deep links or programmatic redirects that should not show a back arrow. Explicit state is more precise.

**Alternative considered:** Check `window.history.length > 1` — fragile; counts browser tabs and prior-session entries, not in-app navigation depth.

## Risks / Trade-offs

- **Future navigators must remember to pass state** — any new page that pushes to `/outlets` must pass `{ state: { canGoBack: true } }`. Risk is low now (only `OutletContextCard` does this), but a CLAUDE.md note is warranted.
  → Mitigation: Document the pattern in `pages/outlets/CLAUDE.md`.

- **State is not preserved across hard reload** — if the user reloads the app while on `/outlets` reached via a push, `location.state` is lost and the back arrow disappears. This is acceptable: a reload is equivalent to a fresh session.

## Open Questions

None — all decisions above are resolved.
