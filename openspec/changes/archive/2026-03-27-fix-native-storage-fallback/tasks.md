## 1. Implementation

- [x] 1.1 Add `isZalo` constant to `storage.ts` using `window.APP_ID` check, and branch all four methods (`getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`) to use `nativeStorage` when in Zalo or `localStorage` otherwise

## 2. Verification

- [x] 2.1 Run `npm run start` in `miniapp/` and confirm the dev server loads without a React error boundary crash in `AuthProvider`
- [x] 2.2 Run `npm run test` in `miniapp/` and confirm all tests pass (storage utility uses `localStorage` path in jsdom)
