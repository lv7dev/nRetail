## ADDED Requirements

### Requirement: AuthLayout renders auth pages without BottomNav
`AuthLayout` SHALL render a centered, full-height container with a `LanguageSwitcher` in the top-right corner and an `<Outlet />` for child page content. It SHALL NOT render `BottomNav`.

#### Scenario: Auth page renders without bottom navigation
- **WHEN** the user navigates to `/login`
- **THEN** no `BottomNav` is visible on the page

#### Scenario: LanguageSwitcher is visible on all auth pages
- **WHEN** any auth page is rendered
- **THEN** the `LanguageSwitcher` is visible in the top-right corner

### Requirement: AppLayout renders app pages with BottomNav
`AppLayout` SHALL render an app shell with `<Outlet />` for page content and `BottomNav` fixed at the bottom. It replaces the current `layout.tsx` behavior.

#### Scenario: App page renders with bottom navigation
- **WHEN** the user navigates to `/`
- **THEN** `BottomNav` is visible at the bottom of the screen

### Requirement: ProtectedRoute redirects unauthenticated users
`ProtectedRoute` SHALL read `useAuthStore().user`. If `user` is `null`, it SHALL redirect to `/login` using `<Navigate replace />`. If `user` is set, it SHALL render its child routes.

#### Scenario: Unauthenticated access redirects to login
- **WHEN** `user` is `null` and user navigates to `/`
- **THEN** the browser redirects to `/login`

#### Scenario: Authenticated user accesses protected route
- **WHEN** `user` is set and user navigates to `/`
- **THEN** `HomePage` renders normally

### Requirement: Auth routes redirect authenticated users to home
When `user` is set in the auth store, navigating to any auth route (`/login`, `/register`, etc.) SHALL redirect to `/`.

#### Scenario: Authenticated user cannot access login page
- **WHEN** `user` is set and user navigates to `/login`
- **THEN** the browser redirects to `/`
