## ADDED Requirements

### Requirement: Coverage configuration with 100% thresholds
`vite.config.mts` SHALL include a `test.coverage` block with `provider: 'v8'`, `all: true`, and thresholds of 100 for statements, branches, functions, and lines. Coverage SHALL be collected only from `src/**/*.{ts,tsx}`. The following patterns SHALL be excluded from coverage collection: `src/app.tsx`, `src/i18n.ts`, `src/setupTests.ts`, `src/setupTests.integration.ts`, `src/mocks/**`, `src/types/**`, `src/**/index.ts`, `src/services/authService.ts`.

#### Scenario: Coverage threshold enforced on test run
- **WHEN** `npm run test:coverage` is executed and any covered file is below 100% on any metric
- **THEN** the process exits non-zero

#### Scenario: Excluded files do not affect coverage score
- **WHEN** `npm run test:coverage` runs
- **THEN** `app.tsx`, `i18n.ts`, `setupTests*.ts`, all `index.ts` barrel files, all `src/types/**` files, `authService.ts`, and all `src/mocks/**` files are absent from the coverage report

#### Scenario: Integration test files excluded from unit coverage run
- **WHEN** `npm run test:coverage` runs
- **THEN** `*.integration.test.*` files are excluded and do not contribute to the threshold

### Requirement: test:coverage npm script
`package.json` SHALL include a `test:coverage` script that runs Vitest with coverage enabled, excluding integration test files, using the same config as `npm run test`.

#### Scenario: Script runs without options
- **WHEN** `npm run test:coverage` is executed in `miniapp/`
- **THEN** unit tests run with v8 coverage and the threshold check is enforced

### Requirement: v8 ignore markers for intentionally unreachable branches
Two source-level `/* v8 ignore */` markers SHALL be added for platform-specific branches that are unreachable outside their runtime environment.

#### Scenario: isZalo branch in storage.ts is excluded from coverage
- **WHEN** coverage runs in the test environment where `window.APP_ID` is undefined
- **THEN** the nativeStorage code path in `storage.ts` is not reported as an uncovered branch

#### Scenario: DEV console.warn in axios.ts is excluded from coverage
- **WHEN** coverage runs in test or production environment where `import.meta.env.DEV` is false
- **THEN** the `console.warn` block in `axios.ts` is not reported as an uncovered branch

### Requirement: Unit tests for useAuthStore
`src/store/useAuthStore.test.ts` SHALL cover all state transitions in the store.

#### Scenario: Initial state
- **WHEN** the store is first accessed
- **THEN** `user` is `null` and `isReady` is `false`

#### Scenario: setAuth sets user and marks ready
- **WHEN** `setAuth(user)` is called with a valid user object
- **THEN** `user` equals the provided user and `isReady` is `true`

#### Scenario: clearAuth clears tokens and nulls user
- **WHEN** `clearAuth()` is called
- **THEN** `user` is `null` and `storage.clearTokens()` has been called

### Requirement: Unit tests for useCartStore
`src/store/useCartStore.test.ts` SHALL cover all store actions and the `cartItemCount` selector.

#### Scenario: add increases cart count
- **WHEN** an item is added via `add(item)`
- **THEN** `cartItemCount` returns 1

#### Scenario: remove decreases cart count
- **WHEN** an item is added then removed via `remove(id)`
- **THEN** `cartItemCount` returns 0

#### Scenario: cartItemCount is 0 when cart is empty
- **WHEN** no items have been added
- **THEN** `cartItemCount` returns 0

### Requirement: Unit tests for apiError utils
`src/utils/apiError.test.ts` SHALL cover all paths in `ApiError` and `resolveApiError`.

#### Scenario: ApiError carries status, message, and code
- **WHEN** `new ApiError(401, 'Unauthorized', 'INVALID_CREDENTIALS')` is constructed
- **THEN** `status` is 401, `message` is 'Unauthorized', `code` is 'INVALID_CREDENTIALS', and `name` is 'ApiError'

#### Scenario: resolveApiError with code returns translated key
- **WHEN** called with an `ApiError` that has a `code` and a mock `t` function
- **THEN** returns `t('errors.INVALID_CREDENTIALS', { defaultValue: err.message })`

#### Scenario: resolveApiError without code returns message
- **WHEN** called with an `ApiError` that has no `code`
- **THEN** returns `err.message` directly

#### Scenario: resolveApiError with non-ApiError returns unknown key
- **WHEN** called with a plain `Error` or unknown object
- **THEN** returns `t('errors.unknown')`

### Requirement: Unit tests for storage utils
`src/utils/storage.test.ts` SHALL cover all localStorage paths. The nativeStorage (Zalo) path is excluded via `/* v8 ignore */` and SHALL NOT be tested.

#### Scenario: getAccessToken returns stored value
- **WHEN** `localStorage` has an `accessToken` key
- **THEN** `storage.getAccessToken()` returns its value

#### Scenario: getRefreshToken returns stored value
- **WHEN** `localStorage` has a `refreshToken` key
- **THEN** `storage.getRefreshToken()` returns its value

#### Scenario: setTokens writes both keys
- **WHEN** `storage.setTokens('acc', 'ref')` is called
- **THEN** `localStorage.getItem('accessToken')` is `'acc'` and `localStorage.getItem('refreshToken')` is `'ref'`

#### Scenario: clearTokens removes both keys
- **WHEN** tokens are set then `storage.clearTokens()` is called
- **THEN** both keys are absent from `localStorage`

#### Scenario: getAccessToken returns null when absent
- **WHEN** `localStorage` has no `accessToken` key
- **THEN** `storage.getAccessToken()` returns `null`

### Requirement: Unit tests for SplashPage
`src/pages/splash/SplashPage.test.tsx` SHALL verify the splash screen renders.

#### Scenario: SplashPage renders the app name and loading spinner
- **WHEN** `<SplashPage />` is rendered
- **THEN** the text "nRetail" is present and a loading indicator is visible

### Requirement: Unit tests for AuthLayout
`src/components/AuthLayout.test.tsx` SHALL verify the layout renders its children via the `<Outlet />` slot.

#### Scenario: AuthLayout renders children via Outlet
- **WHEN** `<AuthLayout />` is rendered inside a `MemoryRouter` with a matching route
- **THEN** the child route content is visible

#### Scenario: AuthLayout renders the LanguageSwitcher
- **WHEN** `<AuthLayout />` is rendered
- **THEN** a language switcher control is present

### Requirement: Unit tests for AppLayout
`src/components/AppLayout.test.tsx` SHALL verify the layout renders its children and the bottom navigation.

#### Scenario: AppLayout renders children via Outlet
- **WHEN** `<AppLayout />` is rendered inside a `MemoryRouter` with a matching route
- **THEN** the child route content is visible

#### Scenario: AppLayout renders BottomNav
- **WHEN** `<AppLayout />` is rendered
- **THEN** the bottom navigation is present

### Requirement: Unit tests for BottomNav
`src/components/shared/BottomNav.test.tsx` SHALL cover rendering, active tab detection, navigation, and cart badge visibility.

#### Scenario: BottomNav renders all five tabs
- **WHEN** `<BottomNav />` is rendered inside a `MemoryRouter`
- **THEN** tabs for Home, Products, Cart, Orders, and Profile are visible

#### Scenario: Active tab is highlighted at root path
- **WHEN** `<BottomNav />` is rendered with current location `/`
- **THEN** the Home tab has the active colour style applied

#### Scenario: Active tab is highlighted for sub-path
- **WHEN** `<BottomNav />` is rendered with current location `/products`
- **THEN** the Products tab has the active colour style applied

#### Scenario: Clicking a tab navigates to its path
- **WHEN** the Products tab button is clicked
- **THEN** the router navigates to `/products`

#### Scenario: Cart badge visible when cart has items
- **WHEN** `useCartStore` has one or more items
- **THEN** a badge with the item count is visible on the Cart tab

#### Scenario: Cart badge hidden when cart is empty
- **WHEN** `useCartStore` has no items
- **THEN** no badge is visible on the Cart tab

### Requirement: Unit tests for stub pages
`home`, `cart`, `products`, `orders`, and `profile` pages SHALL each have a co-located `*.test.tsx` with a render-only test.

#### Scenario: Each stub page renders without error
- **WHEN** the page component is rendered
- **THEN** it mounts without throwing and displays its placeholder content

### Requirement: Unit tests for ProtectedRoute
`src/components/shared/ProtectedRoute.test.tsx` SHALL cover all three routing outcomes.

#### Scenario: Returns null while auth is not ready
- **WHEN** `isReady` is `false` in the auth store
- **THEN** `<ProtectedRoute />` renders nothing (null)

#### Scenario: Redirects to /login when ready but unauthenticated
- **WHEN** `isReady` is `true` and `user` is `null`
- **THEN** `<ProtectedRoute />` renders `<Navigate to="/login" replace />`

#### Scenario: Renders Outlet when ready and authenticated
- **WHEN** `isReady` is `true` and `user` is a valid user object
- **THEN** `<ProtectedRoute />` renders `<Outlet />` and the child content is visible

### Requirement: Unit tests for AuthProvider
`src/components/AuthProvider.test.tsx` SHALL cover all three rehydration paths.

#### Scenario: No token — marks ready immediately without calling getMe
- **WHEN** `AuthProvider` mounts and `storage.getAccessToken()` returns `null`
- **THEN** `authService.getMe` is NOT called and `isReady` is set to `true` with `user` as `null`

#### Scenario: Token present and getMe succeeds — sets auth and marks ready
- **WHEN** `AuthProvider` mounts with a token in storage and `authService.getMe` resolves with a user
- **THEN** `setAuth(user)` is called and children are rendered (isReady = true)

#### Scenario: Token present but getMe fails — clears auth and marks ready
- **WHEN** `AuthProvider` mounts with a token in storage and `authService.getMe` rejects
- **THEN** `clearAuth()` is called and children are rendered (isReady = true, user = null)

#### Scenario: Shows SplashPage until ready
- **WHEN** `AuthProvider` mounts and the getMe call has not yet resolved
- **THEN** `<SplashPage />` is rendered instead of children

### Requirement: Unit tests for register/complete page
`src/pages/auth/register/RegisterComplete.test.tsx` SHALL cover the guard, form submission, error display, and loading state.

#### Scenario: Missing router state redirects to /login
- **WHEN** `<RegisterCompletePage />` renders with no `phone` or `otpToken` in `location.state`
- **THEN** it renders `<Navigate to="/login" replace />`

#### Scenario: Form renders when state is valid
- **WHEN** valid `phone` and `otpToken` are present in `location.state`
- **THEN** name, password, and confirm-password inputs are visible

#### Scenario: Successful submission navigates to /
- **WHEN** the form is submitted with valid data and the `useRegister` mutation succeeds
- **THEN** `navigate('/', { replace: true })` is called

#### Scenario: API error is displayed
- **WHEN** the `useRegister` mutation fails with an `ApiError`
- **THEN** the resolved error message is shown in the alert component

#### Scenario: Button shows loading state while pending
- **WHEN** the mutation is in `isPending` state
- **THEN** the submit button has the loading prop set to `true`

### Requirement: Unit tests for useAuth hooks
`src/hooks/useAuth.test.ts` SHALL cover all exported hooks and their key behaviours.

#### Scenario: useLogin success stores tokens and sets auth
- **WHEN** the login mutation succeeds with a token pair and user
- **THEN** `storage.setTokens` is called with the access and refresh tokens and `setAuth(user)` is called on the store

#### Scenario: useLogout calls clearAuth regardless of API result
- **WHEN** the logout mutation settles (success or error)
- **THEN** `clearAuth()` is called via `onSettled`

#### Scenario: useRequestOtp register flow calls requestRegisterOtp
- **WHEN** `useRequestOtp('register').mutate(phone)` is called
- **THEN** `authService.requestRegisterOtp` is called with the phone number

#### Scenario: useRequestOtp forgot flow calls requestForgotPasswordOtp
- **WHEN** `useRequestOtp('forgot').mutate(phone)` is called
- **THEN** `authService.requestForgotPasswordOtp` is called with the phone number

#### Scenario: useRegister success stores tokens and sets auth
- **WHEN** the register mutation succeeds
- **THEN** `storage.setTokens` and `setAuth(user)` are called

#### Scenario: useVerifyOtp and useResetPassword delegate to authService
- **WHEN** each mutation is called with valid parameters
- **THEN** the corresponding `authService` method is called

### Requirement: Unit tests for axios interceptors
`src/services/axios.test.ts` SHALL cover all distinct paths in the request interceptor, response interceptor, `normalizeError`, and `handleAuthFailure`.

#### Scenario: Request interceptor attaches Bearer token when token exists
- **WHEN** a request is made and `storage.getAccessToken()` returns a token
- **THEN** the `Authorization` header is set to `Bearer <token>`

#### Scenario: Request interceptor omits Authorization when no token
- **WHEN** a request is made and `storage.getAccessToken()` returns `null`
- **THEN** no `Authorization` header is set

#### Scenario: Success response passes through unchanged
- **WHEN** a request returns a 200 response
- **THEN** the response is returned as-is to the caller

#### Scenario: 401 on unauthenticated request propagates as ApiError
- **WHEN** a request without `Authorization` receives a 401
- **THEN** the error is rejected as an `ApiError` with status 401 and no redirect occurs

#### Scenario: 401 on authenticated request with no refresh token redirects
- **WHEN** an authenticated request returns 401 and storage has no refresh token
- **THEN** `storage.clearTokens()` is called and `window.location` is replaced with `/login`

#### Scenario: 401 on authenticated request — refresh succeeds, request retried
- **WHEN** an authenticated request returns 401, the refresh endpoint returns new tokens, and the retry succeeds
- **THEN** the original request is retried with the new access token and the caller receives the successful response

#### Scenario: 401 on authenticated request — refresh fails, redirects
- **WHEN** an authenticated request returns 401 and the refresh endpoint also returns an error
- **THEN** `storage.clearTokens()` is called and `window.location` is replaced with `/login`

#### Scenario: Already-retried 401 is not retried again
- **WHEN** a request with `_retry: true` receives a 401
- **THEN** the error is rejected as an `ApiError` without triggering another refresh

#### Scenario: normalizeError converts AxiosError with body to ApiError
- **WHEN** an AxiosError with `response.data.message` and `response.data.code` is passed
- **THEN** an `ApiError` is returned with matching status, message, and code

#### Scenario: normalizeError handles AxiosError without body message
- **WHEN** an AxiosError has no `response.data.message`
- **THEN** the `error.message` fallback is used

#### Scenario: normalizeError handles non-AxiosError as network error
- **WHEN** a plain `Error` (not an AxiosError) is passed to `normalizeError`
- **THEN** an `ApiError` with status 0 and message 'Network error' is returned

### Requirement: Fill coverage gaps in existing partially-covered files
All existing source files with partial unit test coverage SHALL be brought to 100% by adding targeted tests for currently uncovered lines and branches.

#### Scenario: Icon.tsx all variants covered
- **WHEN** `<Icon />` is rendered with each supported `variant` value
- **THEN** all icon rendering paths (solid, regular, brand, default) are exercised

#### Scenario: OtpInput.tsx all keyboard and paste paths covered
- **WHEN** OTP input fields receive paste events, backspace on empty field, and arrow key navigation
- **THEN** all input handling branches are exercised

#### Scenario: PasswordInput.tsx toggle branch covered
- **WHEN** the show/hide password toggle is clicked
- **THEN** the input type switches between 'password' and 'text', covering both branches

#### Scenario: LanguageSwitcher.tsx language change branch covered
- **WHEN** the language is changed from the current language to another
- **THEN** the i18n change branch on line 19 is exercised

#### Scenario: Login page all branches covered
- **WHEN** login form is rendered and all interaction paths exercised
- **THEN** navigation-after-login and error display branches are covered

#### Scenario: Register schema all validator branches covered
- **WHEN** the register schema is evaluated with various inputs (valid phone, invalid phone, valid with country code)
- **THEN** all branches in the phone regex validation are exercised
