## Why

Protected endpoints like `GET /auth/me` and `POST /auth/logout` return 401 in Swagger UI even after a successful login, because the `@ApiBearerAuth()` decorator is missing — so Swagger never attaches the `Authorization` header to requests for those endpoints.

## What Changes

- Add `@ApiBearerAuth()` decorator to every controller method that uses `@UseGuards(JwtAuthGuard)`
- Establish a convention: `@ApiBearerAuth()` must always accompany `@UseGuards(JwtAuthGuard)` on controller methods

## Capabilities

### New Capabilities

- `swagger-bearer-auth`: Convention and implementation for annotating JWT-protected endpoints so Swagger UI correctly attaches the Bearer token to requests

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- `backend/src/modules/auth/auth.controller.ts` — two endpoints (`/me`, `/logout`) need the decorator
- Any future controller methods that add `@UseGuards(JwtAuthGuard)` must also add `@ApiBearerAuth()`
- No API behavior changes — runtime auth logic is unchanged; this is Swagger documentation only
