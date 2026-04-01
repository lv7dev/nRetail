## Why

The backend has no automated CI/CD pipeline. Code is pushed directly to `main` with no quality gates, and deployment to Render is manual. This creates risk of deploying broken code and makes the release process error-prone.

## What Changes

- Add `.github/workflows/backend.yml` — CI/CD workflow that runs lint, unit tests, and integration tests on every PR and push to `main`
- Add `lint:check` script to `backend/package.json` — runs ESLint without `--fix` for CI (the existing `lint` script with `--fix` is kept for local use)
- Update root `CLAUDE.md` — enforce branch workflow: never push directly to `main`, always create a feature branch and open a PR
- Update root `CLAUDE.md` session completion — reflect that pushes go to feature branches, not `main` directly
- Configure Render Web Service — auto-deploy triggers after CI checks pass on `main`; start command includes `prisma migrate deploy` (free plan has no pre-deploy command)

## Capabilities

### New Capabilities

- `backend-ci-pipeline`: GitHub Actions workflow that lints, runs unit tests, and runs integration tests (Docker Postgres) on `backend/**` changes — on PRs and on merge to `main`
- `backend-render-deploy`: Render Web Service auto-deploy triggered after CI passes on `main`; migrations run as part of start command
- `branch-git-workflow`: Enforced convention — all work happens on feature branches, merged to `main` via PR; CI must pass before merge

### Modified Capabilities

<!-- none — no existing spec-level behavior is changing -->

## Impact

- `backend/package.json` — new `lint:check` script
- `CLAUDE.md` (root) — updated Git conventions and session completion sections
- `.github/workflows/backend.yml` — new file
- Render dashboard — manual setup of Web Service (outside codebase)
- GitHub repository settings — manual setup of branch protection rules (outside codebase)
