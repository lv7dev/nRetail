## 1. SearchInput UI Component

- [x] 1.1 Write failing tests for `SearchInput`: renders icon + input, forwards value/onChange/placeholder/readOnly, className on wrapper
- [x] 1.2 Create `components/ui/SearchInput/SearchInput.tsx` — rounded-xl wrapper with magnifying-glass Icon and `<input>` that spreads InputHTMLAttributes
- [x] 1.3 Create `components/ui/SearchInput/index.ts` barrel export
- [x] 1.4 Add `SearchInput` to `components/ui/index.ts`

## 2. Home SearchBar Migration

- [x] 2.1 Write failing test: SearchBar renders magnifying-glass icon (currently only checks placeholder text)
- [x] 2.2 Update `pages/home/SearchBar.tsx` to use `SearchInput` with `readOnly` — remove hand-crafted div/icon/span

## 3. Outlet List Page — SearchInput + Back Arrow Fix

- [x] 3.1 Update `canGoBack` in `pages/outlets/index.tsx`: replace `location.key !== 'default'` with `!!location.state?.canGoBack`
- [x] 3.2 Replace `Input` with `SearchInput` in the outlet list page search area — wire existing value/onChange/placeholder/aria-label props
- [x] 3.3 Update back-arrow unit test helper in `OutletListPage.test.tsx`: replace `initialEntries={['/', '/outlets']} initialIndex={1}` with a single entry `{ pathname: '/outlets', state: { canGoBack: true } }`
- [x] 3.4 Add unit test: back arrow is hidden when there is no `canGoBack` in router state (covers first-boot scenario)

## 4. OutletContextCard — Navigation State

- [x] 4.1 Write failing test: tapping outlet name calls navigate with `{ state: { canGoBack: true } }`
- [x] 4.2 Update `navigate('/outlets')` in `pages/home/OutletContextCard.tsx` to `navigate('/outlets', { state: { canGoBack: true } })`

## 5. Documentation

- [x] 5.1 Add a note to `pages/outlets/CLAUDE.md` documenting the `canGoBack` state convention: any push navigation to `/outlets` that should show the back arrow must pass `{ state: { canGoBack: true } }`
