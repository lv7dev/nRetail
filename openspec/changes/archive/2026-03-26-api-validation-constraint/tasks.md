## 1. Fix Password Min Length

- [x] 1.1 Change `@MinLength(8)` → `@MinLength(6)` in `src/modules/auth/dto/register.dto.ts` on the `password` field
- [x] 1.2 Change `@MinLength(8)` → `@MinLength(6)` in `src/modules/auth/dto/reset-password.dto.ts` on the `newPassword` field

## 2. Custom ValidationPipe exceptionFactory

- [x] 2.1 Write a failing test in `src/shared/pipes/__tests__/validation.pipe.spec.ts` that asserts a `constraint` field appears in the 400 error when a DTO field fails validation
- [x] 2.2 Create `src/shared/pipes/validation.pipe.ts` with a custom `exceptionFactory` that maps `ValidationError[]` to `{ message: 'Validation failed', errors: [{ field, constraint, message }] }` and throws `BadRequestException`
- [x] 2.3 Register the new `ValidationPipe` globally in `src/main.ts` (replace or update existing global pipe)

## 3. Update AllExceptionsFilter

- [x] 3.1 Update the failing test in `src/shared/filters/__tests__/http-exception.filter.spec.ts`: change the validation error test to assert `constraint` is present in each error item
- [x] 3.2 Update `AllExceptionsFilter` to detect `{ message, errors }` payload from `exception.getResponse()` and pass through `errors` array (including `constraint`) — remove the old string-array detection branch

## 4. Update e2e Tests

- [x] 4.1 Update `test/auth.e2e-spec.ts` validation error test to assert `constraint: 'minLength'` on the password error item
- [x] 4.2 Update `test/auth.e2e-spec.ts` to use `@MinLength(6)` boundary (6-char password passes, 5-char fails)

## 5. Verify & Update Docs

- [x] 5.1 Run `npm run test` in `backend/` — all unit tests pass
- [x] 5.2 Run `npm run test:e2e` in `backend/` — all e2e tests pass (app.e2e-spec.ts boilerplate stub unrelated to this change)
- [x] 5.3 Update validation error shape in `backend/CLAUDE.md` to include `constraint` field in the example
- [x] 5.4 Update `src/modules/auth/CLAUDE.md` to note `@MinLength(6)` on password fields
