## ADDED Requirements

### Requirement: HTTP client wrapper in `src/services/api.ts`
The app SHALL provide a typed HTTP client wrapper at `src/services/api.ts` that encapsulates the base URL, default headers, and error handling for all outbound API requests. All feature service modules SHALL use this wrapper exclusively.

#### Scenario: Successful GET request
- **WHEN** a service calls the HTTP client with a valid path and the server returns 2xx
- **THEN** the client SHALL return the parsed JSON response typed to the caller's expected type

#### Scenario: Non-2xx HTTP response
- **WHEN** the server returns a 4xx or 5xx status
- **THEN** the client SHALL throw a typed `ApiError` containing the status code and response body

#### Scenario: Network failure
- **WHEN** the network is unavailable and the request cannot complete
- **THEN** the client SHALL propagate an error that callers can handle

---

### Requirement: Base URL configurable via environment variable
The HTTP client's base URL SHALL be read from `import.meta.env.VITE_API_BASE_URL` so that dev, staging, and production environments can be targeted without code changes.

#### Scenario: VITE_API_BASE_URL is set
- **WHEN** the env var is defined at build time
- **THEN** all requests SHALL be prefixed with that URL

#### Scenario: VITE_API_BASE_URL is not set
- **WHEN** the env var is absent
- **THEN** the client SHALL default to an empty string (relative paths), and the missing config SHALL be logged as a warning in development

---

### Requirement: Typed ApiError class
The HTTP client SHALL export an `ApiError` class with `status: number` and `body: unknown` properties so that callers can narrow error handling.

#### Scenario: Caller catches ApiError
- **WHEN** a feature service catches an error from the HTTP client
- **THEN** it SHALL be able to use `instanceof ApiError` to distinguish HTTP errors from network errors

---

### Requirement: Feature service pattern
Feature-specific API calls SHALL live in `src/services/<domain>Service.ts` files (e.g., `src/services/productService.ts`). This change SHALL only scaffold the directory and the `api.ts` base client; domain service files are added by future changes.

#### Scenario: Adding a new service
- **WHEN** a developer adds `src/services/productService.ts`
- **THEN** it SHALL import from `src/services/api.ts` and export typed async functions (not raw fetch calls)

---

### Requirement: React Query for server state
All data fetching in components SHALL go through `@tanstack/react-query` hooks. Feature services provide the async functions; React Query hooks in `src/hooks/` call them. Direct service calls from components or stores are NOT allowed.

#### Scenario: Fetching data in a component
- **WHEN** a component needs remote data
- **THEN** it SHALL call a custom hook (e.g., `useProducts()`) that uses `useQuery` internally, not call the service directly

#### Scenario: QueryClientProvider at root
- **WHEN** the app mounts
- **THEN** `QueryClientProvider` SHALL be present at the app root so all hooks have access to the query client
