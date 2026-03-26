## 1. Filter — inject RATE_LIMIT_EXCEEDED code

- [x] 1.1 In `AllExceptionsFilter`, import `ThrottlerException` from `@nestjs/throttler` and add a branch before the existing `HttpException` handling that detects ThrottlerException and responds with `{ statusCode: 429, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED', timestamp, path }`

## 2. Tests

- [x] 2.1 Add a unit test to `http-exception.filter.spec.ts` — when `ThrottlerException` is thrown, the response includes `code: 'RATE_LIMIT_EXCEEDED'` and `statusCode: 429`

## 3. Documentation

- [x] 3.1 Update `backend/CLAUDE.md` Error Handling section — add rule: every error response (including guard-thrown exceptions) must include a `code` field; `AllExceptionsFilter` is the enforcement point
- [x] 3.2 Update the error code table in `backend/src/modules/auth/CLAUDE.md` — add `RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded`

## 4. Verification

- [x] 4.1 Run `npm run test` — all unit tests pass
- [x] 4.2 Run `npm run lint` — no lint errors
