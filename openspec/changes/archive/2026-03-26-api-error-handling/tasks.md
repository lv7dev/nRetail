## 1. Fix AllExceptionsFilter

- [x] 1.1 Update `AllExceptionsFilter` to call `exception.getResponse()` for `HttpException` instead of `exception.message`
- [x] 1.2 Detect ValidationPipe response shape (message is an array) and reformat to `{ statusCode, message: "Validation failed", errors: [{ field, message }] }`
- [x] 1.3 For non-validation `HttpException` responses, pass through `message` and `code` from `getResponse()` directly
- [x] 1.4 Write unit tests for `AllExceptionsFilter` covering: validation error (array message), business error with code, plain string message, 500 unknown error

## 2. Add Error Codes to Auth Service

- [x] 2.1 Update `requestRegisterOtp` — add `code: "PHONE_ALREADY_EXISTS"` to the 409 ConflictException
- [x] 2.2 Update `requestForgotPasswordOtp` — add `code: "PHONE_NOT_FOUND"` to the 404 NotFoundException
- [x] 2.3 Update `verifyOtp` — add `code: "OTP_EXPIRED"` to expired OTP error, `code: "OTP_INVALID"` to wrong/blocked OTP errors
- [x] 2.4 Update `register` — add `code: "OTP_PURPOSE_MISMATCH"` to wrong-purpose error
- [x] 2.5 Update `login` — add `code: "INVALID_CREDENTIALS"` to all 401 errors
- [x] 2.6 Update `resetPassword` — add `code: "OTP_PURPOSE_MISMATCH"`, `code: "PASSWORD_MISMATCH"`, `code: "PHONE_NOT_FOUND"` to respective errors
- [x] 2.7 Update `refresh` — add `code: "REFRESH_TOKEN_INVALID"` to the 401 error

## 3. Update Tests

- [x] 3.1 Update `auth.service.spec.ts` unit tests to assert `code` field on all error cases
- [x] 3.2 Update `auth.e2e-spec.ts` integration tests to assert `code` field on 4xx responses
- [x] 3.3 Add integration test: submit DTO with short password, assert `{ message: "Validation failed", errors: [{ field: "password", ... }] }`
