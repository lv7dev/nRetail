# Mocks

MSW (Mock Service Worker) setup for integration tests. Files here are **test infrastructure only** — never imported in production code.

## Files

| File | Purpose |
|------|---------|
| `server.ts` | Creates and exports the MSW Node server |
| `handlers/auth.ts` | MSW request handlers for all auth endpoints |
| `components/PasswordInput.mock.tsx` | Shared component mock (avoids SVG dynamic import issues in jsdom) |

## server.ts

```ts
import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'

export const server = setupServer(...authHandlers)
```

The server is started in `src/setupTests.integration.ts` before all integration tests and closed after.

## handlers/auth.ts

Defines MSW handlers for every auth endpoint. Key rules:

- **Use wildcard-origin patterns** (`*/auth/login` not `/auth/login`) — MSW v2 Node mode requires absolute URLs; wildcard patterns match any base URL
- **All endpoints return `{ data: T }`** — matching the backend `ResponseInterceptor` envelope
- **`/auth/refresh` also returns `{ data: { accessToken, refreshToken } }`** — `refreshClient` reads `response.data.data.accessToken` because it has no response interceptor and the backend still wraps the response

Handler shape reference:

```ts
// Standard endpoint — wrapped envelope
http.post('*/auth/login', () =>
  HttpResponse.json({ data: { accessToken: '...', refreshToken: '...', user: { ... } } })
)

// /auth/refresh — same envelope, different shape because refreshClient reads data.data
http.post('*/auth/refresh', () =>
  HttpResponse.json({ data: { accessToken: 'new-token', refreshToken: 'new-refresh' } })
)

// Empty response
http.post('*/auth/logout', () => HttpResponse.json({ data: null }))
```

## Overriding handlers in a single test

```ts
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

it('shows error on invalid credentials', async () => {
  server.use(
    http.post('*/auth/login', () =>
      HttpResponse.json(
        { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    )
  )
  // ...test body
})
```

`server.resetHandlers()` in `afterEach` (configured in `setupTests.integration.ts`) automatically restores the default handlers after each test.

## Component mocks

`components/PasswordInput.mock.tsx` exports `MockPasswordInput` — a minimal `<input type="password">` that avoids the SVG icon dynamic import which fails in jsdom. Import it in tests that render forms with `PasswordInput`:

```tsx
vi.mock('@/components/ui/PasswordInput', () => ({
  default: MockPasswordInput,
}))
```
