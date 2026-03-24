## Why

The project is currently a blank Zalo Mini App template with a single "Hello world" page. Before building any retail features, the foundational structure — routing, state management, API layer, and page scaffolding — needs to be established so all future work has a consistent, scalable base to build on.

## What Changes

- Replace the blank homepage with a tabbed navigation shell (bottom tabs)
- Add a page scaffolding pattern with consistent layout conventions
- Introduce a Zustand store organization pattern (`src/store/`)
- Add an HTTP client / service layer (`src/services/`) for future API calls
- Add shared component conventions (`src/components/ui/` and `src/components/shared/`)
- Add custom hooks directory (`src/hooks/`), shared types (`src/types/`), and utilities (`src/utils/`)
- Configure path aliases and folder structure to match intended scale
- Set up testing infrastructure (Vitest + React Testing Library + Playwright)

## Capabilities

### New Capabilities

- `navigation`: Bottom-tab navigation shell with routing for the main sections of the retail app (Home, Products, Cart, Orders, Profile) using React Router
- `state-management`: Zustand store organization pattern — one store per domain under `src/store/`, used for client/UI state only
- `api-client`: HTTP service layer — a fetch wrapper with base URL, auth headers, and error handling, used by all feature services; server state managed via React Query

### Modified Capabilities

<!-- None — no existing specs to update -->

## Impact

- `miniapp/src/` folder structure (new directories: `store/`, `services/`, `hooks/`, `types/`, `utils/`, `components/ui/`, `components/shared/`)
- `miniapp/src/components/layout.tsx` — updated to include bottom tab navigation via React Router
- `miniapp/src/pages/` — new page stubs for main sections
- No external APIs or deployments affected (foundational, no user-visible behavior beyond the nav shell)
