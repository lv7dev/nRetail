## ADDED Requirements

### Requirement: Separate integration test folder and Jest config
`backend/test/` contains all integration tests as `*.integration.spec.ts` files. `backend/test/jest-integration.config.ts` is a separate Jest config with `rootDir: "../"`, `testMatch: ["**/test/**/*.integration.spec.ts"]`, and `testEnvironment: "node"`. A `test:integration` npm script runs this config.

#### Scenario: Unit tests are unaffected
- **WHEN** `npm run test` is executed
- **THEN** only `src/**/*.spec.ts` files run; files in `test/` are not included

#### Scenario: Integration tests run separately
- **WHEN** `npm run test:integration` is executed
- **THEN** only `test/**/*.integration.spec.ts` files run against the real test database

### Requirement: Docker Postgres global setup and teardown
`backend/test/global-setup.ts` is the Jest `globalSetup` script. It starts a Postgres Docker container (or reuses a running one on port 5433), creates the `test_nretail` database if it does not exist, and runs `prisma migrate deploy` against it. `backend/test/global-teardown.ts` drops the test database and stops the container if it was started by the test run.

#### Scenario: Test database is ready before first test runs
- **WHEN** `npm run test:integration` starts
- **THEN** the Postgres container is running, `test_nretail` exists, and all migrations are applied before any test file executes

#### Scenario: Database is isolated from development database
- **WHEN** integration tests run
- **THEN** they connect to `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_nretail`, not the development database

### Requirement: Auth controller integration tests
`backend/test/auth/auth.integration.spec.ts` covers all auth endpoints using `supertest` and a real NestJS app instance connected to the test database. Each test cleans up its own data using `afterEach` truncates or transaction rollbacks.

#### Scenario: POST /auth/otp/register — valid phone issues OTP
- **WHEN** a POST request is sent to `/auth/otp/register` with a valid phone number
- **THEN** the response is `201` and an OTP record exists in the database

#### Scenario: POST /auth/otp/verify — valid OTP returns otpToken
- **WHEN** a valid OTP is submitted to `/auth/otp/verify`
- **THEN** the response is `200` with a signed `otpToken` JWT

#### Scenario: POST /auth/register — valid otpToken and name creates user and returns tokens
- **WHEN** `/auth/register` is called with a valid `otpToken` and a name
- **THEN** the response is `201` with `accessToken` and `refreshToken`, and the user exists in the database

#### Scenario: POST /auth/login — valid credentials return token pair
- **WHEN** `/auth/login` is called with correct phone and password
- **THEN** the response is `200` with `accessToken` and `refreshToken`

#### Scenario: POST /auth/login — wrong password returns 401 with INVALID_CREDENTIALS code
- **WHEN** `/auth/login` is called with wrong password
- **THEN** the response is `401` with `{ code: "INVALID_CREDENTIALS" }`

#### Scenario: POST /auth/refresh — valid refresh token rotates tokens
- **WHEN** `/auth/refresh` is called with a valid refresh token
- **THEN** the response is `200` with a new token pair, and the old refresh token is invalidated in the database

#### Scenario: POST /auth/refresh — invalid/expired token returns 401
- **WHEN** `/auth/refresh` is called with an unknown or expired refresh token
- **THEN** the response is `401` with `{ code: "REFRESH_TOKEN_INVALID" }`

#### Scenario: POST /auth/logout — valid token clears refresh token from DB
- **WHEN** `/auth/logout` is called with a valid Bearer token and refresh token body
- **THEN** the response is `200` and the refresh token no longer exists in the database

#### Scenario: GET /auth/me — valid token returns current user
- **WHEN** `GET /auth/me` is called with a valid Bearer token
- **THEN** the response is `200` with the user's `id`, `phone`, `name`, and `role`

#### Scenario: POST /auth/reset-password — valid otpToken sets new password
- **WHEN** `/auth/reset-password` is called with a valid `otpToken` and new password
- **THEN** the response is `200` and subsequent login with the new password succeeds
