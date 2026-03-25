# nRetail MiniApp

## Overview

Zalo Mini App built with React 18 + TypeScript, targeting the Zalo platform (Vietnamese super app). Uses Vite as build tool, Zustand for state management, React Router for navigation, and Tailwind CSS + standard CSS for styling.

> **Note:** `zmp-sdk`, `zmp-ui`, and `zmp-vite-plugin` are **required Zalo platform dependencies** — they must stay installed for the Mini App to build and run. Do NOT remove them. Only import `zmp-sdk` and `zmp-ui` in application code when explicitly required (use lazy imports for `zmp-sdk`).

## Project Structure

```
├── src/
│   ├── app.ts                      # Bootstrap: imports styles, mounts React app
│   ├── components/
│   │   ├── layout.tsx              # App shell: router, routing
│   │   ├── ui/                     # Reusable, generic UI components (Button, Card, etc.)
│   │   │   └── index.ts            # Barrel export
│   │   └── shared/                 # App-specific shared components (Header, BottomNav, etc.)
│   ├── pages/                      # Route-level components (one file or folder per route)
│   │   └── index.tsx               # Home page (/)
│   ├── store/                      # Zustand stores — one file per domain
│   │   └── useAuthStore.ts
│   ├── hooks/                      # Custom React hooks
│   │   └── useZaloUser.ts          # Zalo SDK wrapper (lazy import)
│   ├── services/                   # API / external service calls
│   │   └── api.ts                  # Base fetch config + shared helpers
│   ├── types/                      # Shared TypeScript interfaces & types
│   ├── utils/                      # Pure helper functions (formatters, zalo helpers, etc.)
│   ├── css/
│   │   ├── app.css                 # App-specific styles
│   │   └── tailwind.css            # Tailwind directives
│   └── static/
│       └── bg.svg                  # Background asset
├── index.html                      # HTML entry point (<div id="app">)
├── package.json
├── tsconfig.json                   # Strict mode, path alias @/* → ./src/*
├── vite.config.mts                 # Root: ./src, plugins: react
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # Tailwind + Autoprefixer
├── app-config.json                 # Zalo Mini App settings (title, theme, safe areas)
├── zmp-cli.json                    # ZMP CLI project metadata
└── .env                            # APP_ID, ZMP_TOKEN (do not commit secrets)
```

## App Flow

`index.html` → `src/app.ts` → `Layout` (components/layout.tsx) → Routes → Pages

## Architecture Principles

### Components
- `components/ui/` — generic, reusable, no business logic (Button, Card, Modal)
- `components/shared/` — app-specific shared components (Header, BottomNav)
- `pages/` — route-level components; may be a single file or a folder for complex routes

### State (Zustand)
One store file per domain. Keep stores focused and small.
```ts
// store/useCartStore.ts
import { create } from 'zustand'

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
}))
```

### Services
All API calls go through `services/`. Never fetch directly in components or stores.
```ts
// services/productService.ts
const BASE = import.meta.env.VITE_API_URL

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`)
  return res.json()
}
```

### Server State (React Query)
Use `@tanstack/react-query` for all data fetching. Wrap `QueryClientProvider` at the app root.
```ts
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/productService'

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: getProducts })
}
```

### Forms (react-hook-form + zod)
Define a zod schema, then pass it via `zodResolver`. Keep schemas co-located with the form or in `src/types/`.
```ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^0\d{9}$/),
})

type FormData = z.infer<typeof schema>

export function CheckoutForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  // ...
}
```

### Zalo SDK
Always wrap `zmp-sdk` calls in a custom hook using lazy `import()` — never import at module level.
```ts
// hooks/useZaloUser.ts
import { useEffect, useState } from 'react'

export function useZaloUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    import('zmp-sdk').then(({ getUserInfo }) => getUserInfo().then(setUser))
  }, [])
  return user
}
```

## Commands

```bash
npm run start       # Dev server via zmp start (localhost:3000)
npm run login       # Authenticate with Zalo (zmp login)
npm run deploy      # Build & deploy to Zalo (zmp deploy)
npm run test        # Run unit/component tests with Vitest
npx playwright test # Run E2E tests
npx playwright test --ui  # Run E2E tests with interactive UI
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| react / react-dom | UI framework |
| react-router-dom | Client-side routing |
| zustand | State management |
| @tanstack/react-query | Server state, async data fetching & caching |
| react-hook-form + @hookform/resolvers | Form state management |
| zod | Schema validation (forms + API responses) |
| zmp-sdk | Zalo Mini App SDK — required platform dep, lazy import only |
| zmp-ui | Zalo UI components — required platform dep, import when needed |
| zmp-vite-plugin | Zalo Vite plugin — required for Mini App to build and run, do NOT remove |
| vite + @vitejs/plugin-react | Build tooling |
| tailwindcss | Styling |
| vitest + @testing-library/react + @testing-library/jest-dom | Unit & component testing |
| playwright + @playwright/test | End-to-end testing |

## Conventions

- **Path aliases**: `@/*` resolves to `./src/*`
- **Styling**: Tailwind utility classes preferred; standard CSS (`.css` files) for complex styles — no SCSS/Sass
- **Components**: Default exports, TypeScript, functional components with hooks
- **Routing**: React Router (`BrowserRouter` / `Routes` / `Route`); add routes in `layout.tsx`
- **State**: Zustand stores in `src/store/` — one store per domain; use for client/UI state only
- **Server state**: `@tanstack/react-query` for all async data fetching, caching, and synchronization
- **Forms**: `react-hook-form` + `zod` resolver for all forms; define schemas in `src/types/` or co-located with the form
- **Validation**: `zod` schemas for form validation and API response parsing
- **Services**: All API calls in `src/services/` — never fetch directly in components
- **Types**: Shared interfaces in `src/types/`
- **Utils**: Pure helpers in `src/utils/` — no side effects
- **Unit/component tests**: Vitest + React Testing Library; test files co-located as `*.test.tsx`
- **E2E tests**: Playwright; test files in `e2e/`
- **Target**: Android 5+, iOS 9.3+, Chrome 49+, Safari 9.1+

## Adding a New Page

1. Create `src/pages/my-page.tsx` (or `src/pages/my-page/index.tsx` for complex pages)
2. Add route in `src/components/layout.tsx`:
   ```tsx
   <Route path="/my-page" element={<MyPage />} />
   ```

## Adding a New Store

1. Create `src/store/useMyStore.ts`
2. Define state + actions with `create<T>()`
3. Import and use the hook directly in components — no Provider needed

## Adding a New Service

1. Create `src/services/myService.ts`
2. Export async functions that call the API
3. Call from hooks or store actions — never directly in JSX

## Testing

- **Framework**: Vitest + React Testing Library + @testing-library/jest-dom
- **Run all tests**: `npm run test`
- **Run single file**: `npx vitest run path/to/file.test.tsx`
- **Run E2E**: `npx playwright test`
- **Test location**: Co-located as `*.test.tsx` next to source files
- **TDD**: Superpowers enforces RED → GREEN → REFACTOR automatically

## Zalo Platform Dependencies

These three packages are **required infrastructure** for Zalo Mini App — never remove them:

| Package | Why Required |
|---|---|
| `zmp-sdk` | Provides Zalo APIs (auth, payment, sharing, etc.) |
| `zmp-ui` | Zalo-native UI components (matches platform look & feel) |
| `zmp-vite-plugin` | Vite plugin that enables `zmp start` / `zmp deploy` to work |

**Usage rules:**
- `zmp-vite-plugin` — configured in `vite.config.mts`, never imported in app code
- `zmp-sdk` — always use lazy `import()` in a custom hook, never at module top level
- `zmp-ui` — import components directly when needed for Zalo-native UI
