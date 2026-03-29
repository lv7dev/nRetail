# Mocks

MSW (Mock Service Worker) setup for integration tests. Files here are **test infrastructure only** — never imported in production code.

## Files

| File                                | Purpose                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| `server.ts`                         | Creates and exports the MSW Node server                           |
| `handlers/auth.ts`                  | MSW request handlers for all auth endpoints                       |
| `components/PasswordInput.mock.tsx` | Shared component mock (avoids SVG dynamic import issues in jsdom) |

## server.ts

```ts
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';

export const server = setupServer(...authHandlers);
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
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

it('shows error on invalid credentials', async () => {
  server.use(
    http.post('*/auth/login', () =>
      HttpResponse.json(
        { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      ),
    ),
  );
  // ...test body
});
```

`server.resetHandlers()` in `afterEach` (configured in `setupTests.integration.ts`) automatically restores the default handlers after each test.

## Component mocks

`components/PasswordInput.mock.tsx` provides a reference implementation of a minimal `PasswordInput` substitute for tests. In practice, most test files define the mock inline using `forwardRef` (required so react-hook-form refs attach correctly):

```tsx
vi.mock('@/components/ui/PasswordInput/PasswordInput', () => {
  // Use require() inside vi.mock factory — static imports are in TDZ when factory runs
  const { forwardRef } = require('react') as typeof import('react');
  return {
    PasswordInput: forwardRef<
      HTMLInputElement,
      { label?: string; error?: string; [k: string]: unknown }
    >(({ label, error, ...props }, ref) => (
      <div>
        {label && <label>{label}</label>}
        <input type="password" aria-label={label ?? 'password'} ref={ref} {...props} />
        {error && <span>{error}</span>}
      </div>
    )),
  };
});
```

> **Why `require` not `import`?** `vi.mock` factories are hoisted to the top of the file by Vitest's transform, running before any `import` statement. Variables declared with `const`/`let` at module scope are in the Temporal Dead Zone at that point. `require()` is synchronous and runs at call time, not at declaration time, so it works safely inside the factory.
