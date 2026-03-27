## Context

NestJS Swagger requires two separate declarations for JWT bearer auth:

1. `DocumentBuilder.addBearerAuth()` in `main.ts` — registers the security scheme in the OpenAPI document (already done)
2. `@ApiBearerAuth()` on each protected controller method — tells Swagger UI to attach the stored token to requests for that specific endpoint

Without step 2, the Swagger "Authorize" dialog accepts a token but silently drops it when calling protected routes. This is not a runtime auth bug — `JwtAuthGuard` works correctly for real clients that send the header manually.

## Goals / Non-Goals

**Goals:**
- All endpoints protected by `JwtAuthGuard` display the lock icon in Swagger UI
- Swagger UI correctly sends `Authorization: Bearer <token>` for those endpoints
- Establish a clear pairing convention so future contributors don't miss it

**Non-Goals:**
- Changes to runtime auth behavior or JWT validation
- API response changes
- Adding auth to currently public endpoints
- Swagger UI login flow automation (Swagger does not support auto-capturing tokens from login responses — this is by design)

## Decisions

**Decision: apply `@ApiBearerAuth()` at the method level, not the controller level**

Auth controllers mix public and protected endpoints in the same controller class. Applying `@ApiBearerAuth()` at the controller level would incorrectly mark public endpoints (login, register, OTP) as requiring auth in the Swagger UI.

Method-level application is precise and explicit.

**Decision: enforce via convention, not tooling**

The pairing rule (`@ApiBearerAuth()` must accompany `@UseGuards(JwtAuthGuard)`) is documented in `backend/CLAUDE.md` and in the `swagger-bearer-auth` spec. A custom ESLint rule could enforce this but adds tooling complexity for a two-decorator pattern. Convention + spec is sufficient for the current team size.

Alternative considered: a shared `@JwtProtected()` custom decorator that stacks both — rejected because it hides Swagger semantics and is harder to discover.

## Risks / Trade-offs

- [Future drift] New protected endpoints may omit `@ApiBearerAuth()` → Mitigation: document the convention in CLAUDE.md and the spec; catches at code review
- [No test coverage for Swagger metadata] `@ApiBearerAuth()` presence isn't verified by existing tests → Mitigation: it's purely decorative metadata; manual Swagger UI verification is sufficient

## Migration Plan

1. Add `@ApiBearerAuth()` to `auth.controller.ts` (logout + me)
2. Update `backend/CLAUDE.md` to document the pairing convention
3. Verify in Swagger UI: lock icons appear, token is sent, `/auth/me` returns 200

No rollback needed — decorator additions are additive and have no runtime effect.
