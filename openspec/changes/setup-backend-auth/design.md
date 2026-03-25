## Context

The backend `auth` module is an empty NestJS scaffold. No Prisma models exist yet. The frontend (Zalo Mini App) needs a working auth API before any other feature can be built. Phase 1 uses phone number as identity with a dev-mode OTP bypass. Phase 2 will wire in the actual Zalo SDK to supply the phone — the backend API stays unchanged.

## Goals / Non-Goals

**Goals:**
- Phone number as the sole identity credential (no password)
- OTP verification before any token is issued
- `PhoneConfig` table as the dev/prod toggle for real vs. default OTP
- Rotating refresh tokens stored hashed in Postgres
- Short-lived JWT access tokens (15 min) + long-lived refresh tokens (30 days)
- Real logout (delete refresh token from DB)
- Shared `JwtAuthGuard` and `@CurrentUser()` decorator ready for all future modules

**Non-Goals:**
- SMS provider integration (Phase 2)
- Zalo SDK token exchange (Phase 2)
- Social login (Google, Facebook)
- Password-based auth
- Rate limiting on OTP endpoints (future hardening)
- Admin-only user seeding

## Decisions

### D1: Two-stage auth (OTP → tokens)

OTP verify returns either full tokens (existing user) or a short-lived `registrationToken` (new user). Client routes to name-entry screen only when needed.

**Why over single endpoint with optional name:** Keeps responsibilities clean. OTP verify = prove phone ownership. Register = create identity. Mixing them would require the client to guess whether name is needed before calling.

**Alternative considered:** Return tokens immediately after OTP with a "profile incomplete" flag. Rejected — issued tokens before profile is complete is confusing and harder to enforce.

### D2: PhoneConfig table as the OTP bypass

A `PhoneConfig` table maps phone numbers to a `defaultOtp`. Any phone in the table skips real OTP generation and uses `defaultOtp` (default `999999`). On every registration, the new phone is auto-inserted into `PhoneConfig`.

**Why over env var / feature flag:** The table is the feature flag. Clearing it disables dev mode with zero code changes. It also allows per-phone control (e.g. testers with specific numbers).

**Alternative considered:** `NODE_ENV === 'development'` check. Rejected — ties the behavior to environment, not configuration. Can't selectively remove numbers as the project matures.

### D3: OTP stored as bcrypt hash in Postgres

OTP is hashed with bcrypt before storage. Lookup is by phone + attempt verification against hash.

**Why over Redis TTL:** Postgres is already the source of truth. Redis adds a dependency for a feature that doesn't need sub-millisecond lookup. Expiry is enforced by `expiresAt` column + query filter.

**Why hash a short numeric OTP:** Mitigates DB read exposure. Also consistent with project convention of never storing secrets in plaintext.

### D4: Refresh token as opaque random string, hashed in Postgres

Generated with `crypto.randomBytes(32)`, stored as bcrypt hash in `RefreshToken` table. Rotated on every use — old token deleted, new one issued.

**Reuse detection:** If a token that was already rotated is presented again, it means potential theft. All refresh tokens for that user are invalidated immediately.

**Why not JWT refresh token:** Can't be revoked. Real logout is a requirement (user loses phone = must be able to invalidate).

### D5: Access token as JWT, 15 min lifetime

Payload: `{ sub: userId, phone, role }`. Verified stateless by `JwtAuthGuard`. No DB lookup on every request.

**Why 15 min (not 7d from .env.example):** Short window limits blast radius if stolen. Refresh tokens handle session continuity transparently.

### D6: UsersModule exports UsersService, AuthModule imports it

Following the project's modular monolith rule: AuthModule imports UsersModule, uses `UsersService` for user lookups and creation. No direct repository access across modules.

## Risks / Trade-offs

- **No OTP rate limiting yet** → A phone can request unlimited OTPs. Mitigation: Each new request deletes the previous OTP, so spamming doesn't accumulate. Rate limiting can be added with `@nestjs/throttler` in a follow-up.
- **bcrypt on OTP is slow** → OTP is 6 digits. bcrypt with cost factor 10 adds ~100ms. Acceptable for auth flows. Mitigation: Use cost factor 8 for OTPs (they're short-lived and not passwords).
- **localStorage token storage** → Tokens readable by JS (XSS risk). Acceptable in Zalo Mini App sandboxed WebView context. Not suitable for public web deployments.
- **No email, no recovery** → If user loses phone, there's no fallback. Acceptable for Phase 1 — recovery strategy is a future concern.

## Migration Plan

1. Install packages: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` + types
2. Add Prisma models (`User`, `RefreshToken`, `OtpVerification`, `PhoneConfig`, `Role` enum)
3. Run first migration: `npx prisma migrate dev --name init-auth`
4. Implement `UsersModule` (service + repository)
5. Implement `AuthModule` (service, controller, guards, strategies)
6. Wire shared guards into `app.module.ts`

Rollback: Drop migration, revert packages. Nothing depends on auth yet.

## Open Questions

- *(resolved)* OTP expiry: 5 minutes ✓
- *(resolved)* Max OTP attempts: 3 ✓
- *(resolved)* Refresh token lifetime: 30 days ✓
- *(resolved)* Name required at registration: yes ✓
- What PORT will the backend run on in `.env`? (Avoid 3000/5000 on macOS — suggest 4000)
