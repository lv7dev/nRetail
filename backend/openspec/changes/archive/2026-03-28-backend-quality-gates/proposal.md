## Why

The backend currently has 67% unit test coverage, no `/health` endpoint, and Jest's coverage config includes un-testable boilerplate files (module definitions, `main.ts`). The gap between what is tested and what runs in production means logic errors, infrastructure failures, and silent regressions can reach users undetected. Closing this gap now, while the codebase is small, is far cheaper than retrofitting tests later.

## What Changes

- **Unit tests** added for all logic-bearing files currently at 0% or partial coverage (interceptors, guards, decorators, repositories, JWT strategy, `users.controller.ts`)
- **Jest coverage exclusions** configured so boilerplate files (`main.ts`, `*.module.ts`, `config.schema.ts`, `configuration.ts`) are excluded — making the coverage number honest and achievable
- **`/health` endpoint** added to the backend — checks Postgres connectivity, returns structured status response
- **Coverage threshold** enforced in Jest config so CI fails if coverage drops below target

## Capabilities

### New Capabilities

- `backend-health-check`: HTTP `/health` endpoint that returns Postgres liveness status, suitable for Docker healthchecks and uptime monitoring

### Modified Capabilities

- `backend-integration-testing`: Coverage exclusion rules and Jest threshold configuration added to the existing integration test setup

## Impact

- `backend/src/` — new `health/` module (controller + service)
- `backend/src/shared/` — new spec files for interceptors, guards, decorators
- `backend/src/modules/auth/__tests__/` — new specs for otp.repository, phone-config.repository, jwt.strategy
- `backend/src/modules/users/__tests__/` — new spec for users.controller, users.repository
- `backend/jest.config.ts` (or `package.json` jest config) — add `coveragePathIgnorePatterns` and `coverageThreshold`
- No API breaking changes; `/health` is a new public endpoint
