## Context

`supertest`'s `Response.body` is typed as `any`. `@typescript-eslint/recommendedTypeChecked` (used in `eslint.config.mjs`) flags every downstream access as `no-unsafe-member-access` or `no-unsafe-assignment`. All 54 errors are in `test/auth/auth.integration.spec.ts`.

The response shapes are already defined as NestJS classes in `src/`:

| Type | Source |
|---|---|
| `ResponseShape<T>` | `src/shared/interceptors/response.interceptor.ts` |
| `OtpVerifyResponse` | `src/modules/auth/dto/auth.response.ts` |
| `TokenPairResponse` | `src/modules/auth/dto/auth.response.ts` |
| `AuthResponse` | `src/modules/auth/dto/auth.response.ts` |
| `ErrorResponse` | `src/modules/auth/dto/auth.response.ts` |
| `UserResponse` | `src/modules/auth/dto/user.response.ts` |

Error responses (from `AllExceptionsFilter`) are **not** wrapped in `ResponseShape` — they are `ErrorResponse` directly.

## Goals / Non-Goals

**Goals:**
- Zero `no-unsafe-assignment` / `no-unsafe-member-access` ESLint errors in test files
- Single point for the unsafe `as` cast — helpers only, not scattered in assertions
- Future test files get typed helpers for free

**Non-Goals:**
- Changing any production code or runtime behavior
- Adding runtime validation of response shapes (this is type-only)
- Typing `supertest` generically (it doesn't support generic body types)

## Decisions

### D1 — New file `test/helpers/response.ts`, not added to `app.ts`

`app.ts` already owns app lifecycle (`createTestApp` / `closeTestApp`). Response parsing is a separate concern. A dedicated `response.ts` keeps each helper file single-purpose and easy to find.

Alternative considered: inline `as` casts in each test. Rejected — scatters the unsafe cast across every assertion and gives future tests no reusable pattern.

### D2 — Two helpers covering both response envelopes

```ts
// Success: { data: T } envelope from ResponseInterceptor
function parseData<T>(res: Response): T

// Error: { statusCode, message, code } directly from AllExceptionsFilter
function parseError(res: Response): ErrorResponse
```

A single generic helper was considered but rejected — success and error responses use different shapes, so separate functions make call sites unambiguous.

### D3 — Import types from `src/` directly (cross-boundary)

Test files importing from `src/` is standard in NestJS integration test suites. The types are the canonical source of truth — if a response shape changes in `src/`, the test immediately fails to compile, which is the desired behavior.

Alternative considered: duplicate plain interfaces in `test/`. Rejected — they'd drift from the real types and lose the compile-time safety benefit.

### D4 — `import type` only (no runtime import of NestJS classes)

The helpers only need the TypeScript types, not the class constructors. Using `import type` avoids pulling NestJS decorators and `@ApiProperty` metadata into the test bundle unnecessarily.

## Risks / Trade-offs

- **`as` cast is still unsafe at runtime** → Integration tests hit a real server, so the cast is validated empirically — if the shape is wrong, an assertion fails. This is acceptable for test code.
- **Cross-boundary import couples test to src structure** → Accepted trade-off. If a DTO moves, the import breaks at compile time, which is the right signal.
