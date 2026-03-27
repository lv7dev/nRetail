## 1. Create response helper file

- [x] 1.1 Create `test/helpers/response.ts` with `import type` for `ResponseShape`, `ErrorResponse` from `src/`
- [x] 1.2 Implement `parseData<T>(res: Response): T` — casts `res.body as ResponseShape<T>` and returns `.data`
- [x] 1.3 Implement `parseError(res: Response): ErrorResponse` — casts `res.body as ErrorResponse`

## 2. Update auth.integration.spec.ts

- [x] 2.1 Add import of `parseData` and `parseError` from `../helpers/response`
- [x] 2.2 Test 5.2 — replace `res.body.data.otpToken` accesses with `parseData<OtpVerifyResponse>(res)`
- [x] 2.3 Test 5.3 — replace `res.body.data.*` accesses with `parseData<AuthResponse>(res)`
- [x] 2.4 Test 5.4 — replace `res.body.data.*` accesses with `parseData<AuthResponse>(res)`
- [x] 2.5 Test 5.5 — replace `res.body.code` with `parseError(res).code`
- [x] 2.6 Test 5.6 — replace success `res.body.data.*` with `parseData<TokenPairResponse>(res)`, error `replayRes.body.code` with `parseError(replayRes).code`
- [x] 2.7 Test 5.7 — replace `res.body.code` with `parseError(res).code`
- [x] 2.8 Test 5.8 — replace `loginRes.body.data.*` with `parseData<AuthResponse>(loginRes)`
- [x] 2.9 Test 5.9 — replace `res.body.data.*` with `parseData<UserResponse>(res)`
- [x] 2.10 Test 5.10 — replace all `res.body.data.*` accesses across the 4 sub-steps with typed helpers

## 3. Verify

- [x] 3.1 Run `npx eslint test/auth/auth.integration.spec.ts` — zero `no-unsafe-assignment` / `no-unsafe-member-access` errors
- [x] 3.2 Run `npm run test:integration` — all 10 tests pass
