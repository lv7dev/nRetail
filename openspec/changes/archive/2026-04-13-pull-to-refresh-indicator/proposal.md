## Why

`ScrollablePage` currently shows a spinner the moment `pullDistance > 0` — even at 1px of pull — and the wheel path triggers a refresh with no visual build-up at all. Users get no affordance telling them what gesture is available or how far they need to pull, which makes the interaction feel abrupt and unpolished.

## What Changes

- Replace the instant top spinner with an elastic-height pull indicator that grows with finger distance
- Show "Pull down to refresh" text + down-arrow while below the 60px threshold
- Flip the arrow 180° and swap text to "Release to refresh" when the threshold is crossed
- Switch to the spinner only after the user lifts their finger (release-to-confirm)
- Add `scrollablePage.pullToRefresh` and `scrollablePage.releaseToRefresh` i18n keys to both `vi` and `en` locale files under the `common` namespace
- Wheel path is unchanged: still triggers immediately and jumps straight to the spinner

## Capabilities

### New Capabilities

- `pull-to-refresh-indicator`: The visual indicator component rendered above scroll content during a pull gesture — elastic height, arrow direction, text label, and spinner state.

### Modified Capabilities

- `scrollable-page`: Pull-to-refresh requirement gains new staged UX behaviour (elastic height, below/above-threshold states, release-to-confirm trigger); existing scenario wording stays valid but new scenarios are added.

## Impact

- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — replace top spinner with new indicator
- `miniapp/src/components/shared/ScrollablePage/ScrollablePage.test.tsx` — new test cases for indicator states
- `miniapp/src/locales/vi/common.json` — add `scrollablePage.pullToRefresh`, `scrollablePage.releaseToRefresh`
- `miniapp/src/locales/en/common.json` — same keys in English
- No API changes. No breaking prop changes on `ScrollablePageProps`.
