## Why

Three TypeScript errors in the miniapp surface during type-checking: `window.APP_CONFIG` is untyped, a PasswordInput mock uses `[k: string]: unknown` which breaks JSX prop spreading, and `playwright.config.ts` is outside every tsconfig that includes Node types. These are blocking clean `tsc --noEmit` runs and IDE type feedback.

## What Changes

- Add a `src/global.d.ts` file that extends the `Window` interface with the `APP_CONFIG` property, typed from `app-config.json`
- Fix the `PasswordInput` mock in `RegisterComplete.test.tsx` to use `React.InputHTMLAttributes<HTMLInputElement>` instead of `[k: string]: unknown` as the rest-props type
- Update `e2e/tsconfig.json` to include `../playwright.config.ts` so it gets Node + `@playwright/test` types

## Capabilities

### New Capabilities

- `miniapp-global-types`: Declaration of global browser-window augmentations used by the miniapp bootstrap (currently just `APP_CONFIG`)

### Modified Capabilities

<!-- No existing spec-level behavior is changing — these are typing fixes only. -->

## Impact

- `miniapp/src/app.tsx` — no code change; type error resolved by new declaration file
- `miniapp/src/pages/auth/register/RegisterComplete.test.tsx` — one-line generic argument change, no runtime change
- `miniapp/e2e/tsconfig.json` — add one entry to `include` array
- `miniapp/src/global.d.ts` — new file (created)
