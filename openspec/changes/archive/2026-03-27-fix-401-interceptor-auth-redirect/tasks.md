## 1. Tests (write failing tests first)

- [x] 1.1 Add test: 401 on request without Authorization header rejects with ApiError, no redirect, no token clear
- [x] 1.2 Add test: 401 on request with Authorization header still triggers silent refresh flow
- [x] 1.3 Add test: `POST /auth/login` 401 propagates INVALID_CREDENTIALS error to caller
- [x] 1.4 Add test: `POST /auth/otp/verify` 401 propagates OTP_INVALID error to caller

## 2. Implementation

- [x] 2.1 In `miniapp/src/services/axios.ts` response interceptor, add `wasAuthenticated` check before the refresh/redirect branch
- [x] 2.2 Confirm all new tests pass, existing tests unchanged
