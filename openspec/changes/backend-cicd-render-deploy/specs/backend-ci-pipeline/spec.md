## ADDED Requirements

### Requirement: Backend CI runs on pull requests targeting main
The system SHALL run lint, unit tests, and integration tests on every pull request that changes files under `backend/**`.

#### Scenario: PR with backend changes triggers CI
- **WHEN** a pull request targeting `main` is opened or updated with changes in `backend/`
- **THEN** the `backend-ci` workflow runs lint:check, unit tests, and integration tests

#### Scenario: PR with only miniapp changes does not trigger backend CI
- **WHEN** a pull request targeting `main` changes only files in `miniapp/`
- **THEN** the backend CI workflow does NOT run

### Requirement: Backend CI runs on merge to main
The system SHALL run lint, unit tests, and integration tests on every push to `main` that changes files under `backend/**`.

#### Scenario: Merge to main triggers CI
- **WHEN** a PR is merged to `main` and the merge commit includes changes in `backend/`
- **THEN** the backend CI workflow runs and reports a GitHub commit status

### Requirement: CI job order fails fast
The workflow SHALL run steps in order: lint → unit tests → integration tests. A failure at any step SHALL stop subsequent steps.

#### Scenario: Lint failure stops CI early
- **WHEN** `npm run lint:check` exits non-zero
- **THEN** unit tests and integration tests do not run

### Requirement: Integration tests run with an isolated Docker Postgres instance
The CI workflow SHALL provide a Docker environment where `global-setup.ts` can start `postgres:15-alpine` on port 5433.

#### Scenario: Integration tests pass in CI
- **WHEN** the CI runner executes `npm run test:integration`
- **THEN** `global-setup.ts` starts the Docker container, runs migrations, and all integration test assertions pass

### Requirement: lint:check script fails on violations without auto-fixing
`package.json` SHALL include a `lint:check` script that runs ESLint without `--fix`. It SHALL exit non-zero if any lint violation is found.

#### Scenario: Violation detected in CI
- **WHEN** `npm run lint:check` is run and a file has an ESLint violation
- **THEN** the script exits non-zero and prints the violation location
