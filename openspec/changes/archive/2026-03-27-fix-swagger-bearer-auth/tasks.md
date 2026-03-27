## 1. Annotate Protected Endpoints in auth.controller.ts

- [x] 1.1 Add `@ApiBearerAuth()` to the `getMe()` method (`GET /auth/me`)
- [x] 1.2 Add `@ApiBearerAuth()` to the `logout()` method (`POST /auth/logout`)

## 2. Document the Convention

- [x] 2.1 Add a note to `backend/CLAUDE.md` stating that `@ApiBearerAuth()` must always accompany `@UseGuards(JwtAuthGuard)` on controller methods

## 3. Verify in Swagger UI

- [ ] 3.1 Start the backend dev server and open Swagger UI (`/api`)
- [ ] 3.2 Confirm lock icons appear on `GET /auth/me` and `POST /auth/logout`
- [ ] 3.3 Log in via Swagger, enter the access token in the Authorize dialog, and confirm `GET /auth/me` returns 200

