## 1. i18n Keys

- [x] 1.1 Add `scrollablePage.pullToRefresh: "Kéo xuống để làm mới"` to `miniapp/src/locales/vi/common.json`
- [x] 1.2 Add `scrollablePage.releaseToRefresh: "Thả để làm mới"` to `miniapp/src/locales/vi/common.json`
- [x] 1.3 Add `scrollablePage.pullToRefresh: "Pull down to refresh"` to `miniapp/src/locales/en/common.json`
- [x] 1.4 Add `scrollablePage.releaseToRefresh: "Release to refresh"` to `miniapp/src/locales/en/common.json`

## 2. Tests — PullIndicator sub-component

- [x] 2.1 Add test: `pullDistance=0, isRefreshing=false` → indicator not rendered
- [x] 2.2 Add test: `pullDistance=30` → container height `30px`, chevron has no `rotate-180`, label is `scrollablePage.pullToRefresh`
- [x] 2.3 Add test: `pullDistance=60` → container height `48px` (capped), chevron has `rotate-180`, label is `scrollablePage.releaseToRefresh`
- [x] 2.4 Add test: `pullDistance=80` → container height stays `48px` (cap holds)
- [x] 2.5 Add test: `isRefreshing=true, pullDistance=0` → spinner shown, no text/arrow indicator

## 3. Tests — touch release behaviour

- [x] 3.1 Add test: touchEnd at `pullDistance < 60` → `onRefresh` NOT called, `pullDistance` resets to `0`
- [x] 3.2 Add test: touchEnd at `pullDistance >= 60` → `onRefresh` called, `pullDistance` resets to `0` after resolve

## 4. Implementation — PullIndicator sub-component

- [x] 4.1 Add `import { useTranslation } from 'react-i18next'` to `ScrollablePage.tsx`
- [x] 4.2 Add `PullIndicator` internal sub-component in `ScrollablePage.tsx` accepting `{ pullDistance: number; isRefreshing: boolean }` props
- [x] 4.3 Render a container div with `style={{ height: Math.min(pullDistance, 48) }}` and `overflow-hidden` — visible only when `pullDistance > 0`
- [x] 4.4 Inside the container, render `<Icon name="chevron-down" />` wrapped in a div with `transition-transform duration-200` and `rotate-180` class applied conditionally when `pullDistance >= 60`
- [x] 4.5 Beside the icon render the i18n label: `pullDistance >= 60 ? t('scrollablePage.releaseToRefresh') : t('scrollablePage.pullToRefresh')`
- [x] 4.6 When `isRefreshing` is `true` and `pullDistance === 0`, render `<Spinner label="Refreshing content" />` instead of the text indicator
- [x] 4.7 Replace the existing `{(pullDistance > 0 || isRefreshing) && <Spinner label="Refreshing content" />}` line in the JSX with `<PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />`

## 5. Verification

- [x] 5.1 Run `npm run test` in `miniapp/` — all tests green including new ones
- [x] 5.2 Run `npx prettier --write miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx`
- [ ] 5.3 Manual check in browser: pull down slowly — container grows, text shows, arrow flips at 60px, spinner appears on release
- [ ] 5.4 Manual check: release before 60px — indicator disappears, no refresh triggered
