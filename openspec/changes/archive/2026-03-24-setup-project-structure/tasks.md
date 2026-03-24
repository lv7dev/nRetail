## 1. Dependencies

- [ ] 1.1 Install `react-router-dom` and `@types/react-router-dom`
- [ ] 1.2 Install `zustand`
- [ ] 1.3 Install `@tanstack/react-query`
- [ ] 1.4 Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- [ ] 1.5 Install `playwright` and `@playwright/test`
- [ ] 1.6 Remove `jotai` from dependencies (no longer used)
- [ ] 1.7 Remove `sass` from devDependencies (no longer used)

## 2. Build & Test Config

- [ ] 2.1 Update `vite.config.mts` — remove `zmp-vite-plugin`, add Vitest config (`test.environment: 'jsdom'`, `setupFiles`)
- [ ] 2.2 Create `src/setupTests.ts` — import `@testing-library/jest-dom`
- [ ] 2.3 Add `test` and `test:e2e` scripts to `package.json`
- [ ] 2.4 Initialize Playwright config (`playwright.config.ts`) with `e2e/` as test directory

## 3. CSS Migration

- [ ] 3.1 Rename `src/css/app.scss` → `src/css/app.css`
- [ ] 3.2 Rename `src/css/tailwind.scss` → `src/css/tailwind.css`
- [ ] 3.3 Update imports in `src/app.ts` to reference the new `.css` filenames

## 4. Folder Structure

- [ ] 4.1 Create `src/store/` directory
- [ ] 4.2 Create `src/hooks/` directory
- [ ] 4.3 Create `src/services/` directory
- [ ] 4.4 Create `src/types/` directory
- [ ] 4.5 Create `src/utils/` directory
- [ ] 4.6 Create `src/components/ui/` directory with `index.ts` barrel export
- [ ] 4.7 Create `src/components/shared/` directory
- [ ] 4.8 Create `e2e/` directory for Playwright tests

## 5. State Management (Zustand)

- [ ] 5.1 Create `src/store/useCartStore.ts` — store with `items: CartItem[]`, `add`, `remove`, `clear` actions; export `cartItemCount` selector
- [ ] 5.2 Create `src/store/useAuthStore.ts` — store with `user: { id: string; name: string } | null`, `setUser`, `clearUser` actions
- [ ] 5.3 Ensure all store types are explicitly typed with TypeScript interfaces in `src/types/`

## 6. API Client

- [ ] 6.1 Create `src/services/api.ts` with `ApiError` class (`status: number`, `body: unknown`)
- [ ] 6.2 Add typed `get<T>`, `post<T>`, `put<T>`, `del<T>` functions that read base URL from `import.meta.env.VITE_API_BASE_URL`
- [ ] 6.3 Log a dev warning when `VITE_API_BASE_URL` is not set
- [ ] 6.4 Wrap `QueryClientProvider` at the app root in `src/app.ts`

## 7. Page Stubs

- [ ] 7.1 Create `src/pages/home.tsx` — stub page with "Home" placeholder
- [ ] 7.2 Create `src/pages/products.tsx` — stub page with "Products" placeholder
- [ ] 7.3 Create `src/pages/cart.tsx` — stub page with "Cart" placeholder
- [ ] 7.4 Create `src/pages/orders.tsx` — stub page with "Orders" placeholder
- [ ] 7.5 Create `src/pages/profile.tsx` — stub page with "Profile" placeholder
- [ ] 7.6 Remove or repurpose the existing `src/pages/index.tsx` (the "Hello world" page)

## 8. Navigation Shell

- [ ] 8.1 Update `src/components/layout.tsx` — replace ZMPRouter with React Router (`BrowserRouter` + `Routes`)
- [ ] 8.2 Create `src/components/shared/BottomNav.tsx` — custom bottom tab bar component
- [ ] 8.3 Wire each tab to its route using `useNavigate` from `react-router-dom`
- [ ] 8.4 Add all five routes (`/`, `/products`, `/cart`, `/orders`, `/profile`) to `Routes`
- [ ] 8.5 Add active tab highlighting (sync selected tab with current route via `useLocation`)
- [ ] 8.6 Add cart item count badge to the Cart tab (read count from `useCartStore`)
- [ ] 8.7 Add a catch-all/fallback route that redirects unknown paths to `/`

## 9. Verification

- [ ] 9.1 Run `npm run start` and confirm the app launches with bottom tabs visible
- [ ] 9.2 Tap each tab and confirm routing works
- [ ] 9.3 Confirm TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] 9.4 Run `npm run test` and confirm Vitest runs (zero tests is fine at this stage)
- [ ] 9.5 Run `npx playwright test` and confirm Playwright is configured correctly
