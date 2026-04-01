## 1. Backend package.json

- [x] 1.1 Add `lint:check` script to `backend/package.json`: `eslint "{src,apps,libs,test}/**/*.ts"` (no `--fix`)

## 2. GitHub Actions workflow

- [x] 2.1 Create `.github/workflows/backend.yml` with triggers: `push` to `main` and `pull_request` targeting `main`, both scoped to `paths: ['backend/**']`
- [x] 2.2 Add `test` job: checkout → Node 22 setup (with npm cache) → `npm ci` → `npm run lint:check` → `npm run test` → `npm run test:integration`
- [x] 2.3 Verify workflow file is valid YAML and job names match what will be used as required status checks in GitHub branch protection

## 3. CLAUDE.md updates

- [x] 3.1 Update root `CLAUDE.md` Git conventions section — add rules: never push directly to `main`, always create a feature branch, open a PR, delete branch after merge
- [x] 3.2 Update root `CLAUDE.md` session completion section — change the push step to reflect pushing the feature branch (not `main`) and opening/updating a PR

## 4. Manual setup (outside codebase — document steps)

- [x] 4.1 Create Render Web Service: root dir `backend`, build `npm ci && npm run build`, start `npx prisma migrate deploy && node dist/main`, health check `/health`, auto-deploy "After CI checks pass"
- [x] 4.2 Set all required env vars in Render dashboard (`NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `REGISTRATION_TOKEN_EXPIRES_IN`, `THROTTLE_LIMIT`, `THROTTLE_TTL`)
- [x] 4.3 Enable GitHub branch protection on `main`: require PR, require status checks (add job name `test` after first workflow run), require up-to-date branches, disallow bypassing for admins
- [x] 4.4 Enable GitHub "Automatically delete head branches" in repo settings
