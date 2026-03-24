## Context

The project is a Zalo Mini App (ZMP) targeting Vietnamese retail users. It runs inside the Zalo super app on Android/iOS. The current codebase is a blank ZMP template with a single route and no meaningful structure. Before any feature work, the project needs a consistent structural foundation: navigation shell, state organization, and API access patterns.

Key constraints:
- `zmp-sdk` and `zmp-ui` are kept as dependencies but are NOT used by default — only imported when explicitly required
- Platform target: Android 5+, iOS 9.3+ — no cutting-edge JS features
- State: Zustand (replacing Jotai)
- No backend exists yet — API client must be designed to integrate later

## Goals / Non-Goals

**Goals:**
- Establish a bottom-tab navigation shell covering 5 main sections (Home, Products, Cart, Orders, Profile)
- Define a clear folder and file convention for Zustand stores (`src/store/`)
- Add an HTTP client wrapper with base config, ready for API integration
- Add React Query for server state management
- Scaffold stub pages so all routes exist and are navigable
- Set up testing infrastructure (Vitest + React Testing Library for unit/component tests, Playwright for E2E)

**Non-Goals:**
- Implementing any actual retail features (product listing, cart logic, orders)
- Backend API integration or authentication (future changes)
- Design system tokens or theming (can layer on top of this structure)

## Decisions

### Navigation: React Router, not ZMPRouter

**Decision**: Use `react-router-dom` (`BrowserRouter` + `Routes` + `Route`) for routing. Build a custom bottom tab bar component in `src/components/shared/`.

**Why**: The project is moving away from `zmp-ui` as the default — zmp-ui/zmp-sdk are kept as deps but not actively used. React Router is the standard, well-documented routing solution for React apps and avoids coupling the navigation architecture to the ZMP platform library.

**Alternative considered**: ZMPRouter + AnimationRoutes from zmp-ui — rejected because we are no longer defaulting to zmp-ui components.

---

### State: Domain-scoped Zustand stores under `src/store/`

**Decision**: Organize Zustand stores into `src/store/use<Domain>Store.ts` files (e.g., `src/store/useCartStore.ts`, `src/store/useAuthStore.ts`). No Provider needed — stores are imported directly. Used for client/UI state only.

**Why**: Zustand is simpler than Jotai for most use cases — stores are plain objects with actions co-located, making them easier to read and test. One file per domain avoids bloat and is easy to navigate at this scale.

**Alternative considered**: Jotai atoms — replaced because Zustand's store model (state + actions together) is a better fit for domain-scoped state and requires less boilerplate for mutations.

---

### Server State: React Query

**Decision**: Use `@tanstack/react-query` for all async data fetching, caching, and synchronization. Wrap `QueryClientProvider` at the app root. Feature hooks (e.g., `useProducts`) live in `src/hooks/`.

**Why**: Separating server state (remote data) from client state (UI) is a well-established pattern. React Query handles caching, background refetch, and loading/error states, so stores stay free of async logic.

---

### API Layer: Thin fetch wrapper, no heavy client library

**Decision**: Add a minimal `src/services/http.ts` that wraps `fetch` with base URL, default headers, and typed error handling. Feature services (e.g., `src/services/productService.ts`) import from it.

**Why**: No backend exists yet. A lightweight wrapper avoids lock-in while establishing the pattern for all future service modules. Adding Axios or a different client later is straightforward once requirements are clearer.

**Alternative considered**: Axios — rejected as over-engineered for this stage; the ZMP target browsers all support native fetch.

---

### Testing: Vitest + React Testing Library + Playwright

**Decision**: Use Vitest (not Jest) for unit/component tests, with `@testing-library/react` and `@testing-library/jest-dom`. Use Playwright for E2E tests in `e2e/`.

**Why**: Vitest integrates natively with Vite — same config, same transforms, no Babel workarounds. Its API is Jest-compatible so the learning curve is minimal. Playwright is the modern standard for cross-browser E2E testing.

---

### Folder structure

```
src/
├── app.ts                       # unchanged — bootstrap
├── components/
│   ├── layout.tsx               # updated — React Router shell + bottom tabs
│   ├── ui/                      # NEW — generic, reusable UI (Button, Card, Modal)
│   │   └── index.ts             # barrel export
│   └── shared/                  # NEW — app-specific shared (Header, BottomNav)
├── pages/                       # one file (or folder) per route
│   ├── index.tsx                # Home (/)
│   ├── products.tsx
│   ├── cart.tsx
│   ├── orders.tsx
│   └── profile.tsx
├── store/                       # NEW — Zustand stores, one per domain
│   ├── useAuthStore.ts
│   └── useCartStore.ts
├── hooks/                       # NEW — custom React hooks
│   └── useZaloUser.ts           # Zalo SDK wrapper (lazy import)
├── services/                    # NEW — API client and feature services
│   ├── api.ts                   # base fetch config + helpers
│   └── (productService.ts, etc. added later)
├── types/                       # NEW — shared TypeScript interfaces & types
├── utils/                       # NEW — pure helper functions
├── css/                         # renamed .scss → .css
│   ├── app.css
│   └── tailwind.css
└── static/                      # unchanged
```

## Risks / Trade-offs

- **Custom bottom nav vs ZMP BottomNavigation** → Mitigation: The custom nav is a simple flex container; if ZMP-native nav is needed later, it can be swapped in `layout.tsx` with minimal impact on pages.
- **Stub pages may accumulate stale TODOs** → Mitigation: Each stub renders a visible placeholder with the page name; easy to spot and replace.
- **HTTP client design baked in before API contract known** → Mitigation: The wrapper is intentionally minimal — adding auth headers, interceptors, or retry logic later is additive, not breaking.
- **React Query QueryClientProvider placement** → Mitigation: Wrap at the app root in `app.ts` so all pages and hooks have access.
