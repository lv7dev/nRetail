# nRetail — Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Project Overview

**nRetail** is a multi-service retail/ecommerce platform with two main apps:

| App | Stack | Directory |
|---|---|---|
| **miniapp** | React 18 + TypeScript + Vite + Zalo Mini App SDK | `miniapp/` |
| **backend** | NestJS 11 + TypeScript 5 + Node 22 | `backend/` |

See `miniapp/CLAUDE.md` and `backend/CLAUDE.md` for app-specific architecture and conventions.

---

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd update <id> --status=closed  # Complete work (bd close has ID resolver bug in v0.62.0)
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push origin <branch-name>   # push the feature branch, NOT main
   git status  # MUST show "up to date with origin"
   ```
   Then open or update the PR on GitHub. `main` is updated only via merged PRs — never direct push.
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

---

## Tool Integration

This project uses three tools together. Each owns a distinct concern:

| Tool | Purpose | Concern |
|---|---|---|
| **Beads** (`bd`) | Task tracking & prioritization | What to work on next |
| **OpenSpec** (`/opsx:*`) | Spec-driven planning & requirements | What exactly to build |
| **Superpowers** | Development methodology (auto-activates) | How to build it right |

### Workflow

```
bd ready → claim task → /opsx:propose → implement with TDD → /opsx:verify → bd update <id> --status=closed → git push
```

### Rules

- **Planning**: Use OpenSpec (`/opsx:propose`, `/opsx:explore`) for specs and plans — NOT Superpowers' deprecated `/write-plan`
- **Task tracking**: Use Beads (`bd create`, `bd ready`, `bd update <id> --status=closed`) — NOT TodoWrite or markdown TODOs
- **TDD**: Superpowers enforces this automatically — no need to request it
- **Code review**: Superpowers dispatches reviewer subagents automatically
- **Specs live in**: `openspec/changes/<name>/` (active) and `openspec/specs/` (archived)
- Link Beads issues to OpenSpec: `bd update <id> --spec-id "openspec/changes/<name>"`
- Include Beads issue ID in commits: `feat: add dark mode (nretail-xxx)`
- **ALWAYS create a Beads issue BEFORE generating an OpenSpec proposal** — run `bd create` then `bd update <id> --spec-id "openspec/changes/<name>"` as the first two steps of `/opsx:propose`

### OpenSpec Context

- Frontend: React 18, TypeScript, Vite, Zustand, React Router, TanStack Query, Tailwind CSS
- Backend: NestJS 11, TypeScript 5, PostgreSQL, Prisma, Redis, BullMQ
- Testing: Vitest + React Testing Library (miniapp), Jest (backend), Playwright (E2E)
- Each task should be small enough for one TDD cycle (test + implement)
- Write testable requirements with clear WHEN/THEN scenarios

---

## Build & Test

### Miniapp (frontend)

```bash
cd miniapp
npm install                   # Install dependencies
npm run start                 # Dev server (zmp start, localhost:3000)
npm run test                  # Unit/component tests (Vitest)
npm run test:integration      # Integration tests (Vitest + MSW)
npm run test -- path/to/file.test.tsx  # Run single test file
npx playwright test           # E2E tests (requires backend + Redis)
npx playwright test --ui      # E2E tests with interactive UI
```

### Backend

```bash
cd backend
npm install                   # Install dependencies
npm run start:dev             # Dev server with hot reload (port 3000)
npm run build                 # Compile to dist/
npm run lint                  # ESLint + Prettier auto-fix
npm run test                  # Unit tests (Jest)
npm run test:integration      # Integration tests (Jest + real Docker Postgres on port 5433)
npm run test:cov              # Tests with coverage
npm run test:e2e              # End-to-end tests
```

### Quality Gates (run before closing a session)

```bash
# Unit tests + lint (fast, always run)
cd miniapp && npm run test && cd ../backend && npm run test && npm run lint

# Integration tests (requires Docker for backend)
cd miniapp && npm run test:integration && cd ../backend && npm run test:integration

# E2E tests (requires Docker + Redis + both servers)
cd miniapp && npx playwright test
```

---

## Architecture Overview

### Monorepo Structure

```
nRetail/
├── CLAUDE.md              ← You are here (root project rules)
├── .prettierrc            ← Shared Prettier config (all apps inherit this)
├── .prettierignore        ← Prettier ignore rules (node_modules, dist, generated, lock files)
├── miniapp/               ← Zalo Mini App (React + Vite)
│   ├── CLAUDE.md          ← Frontend-specific rules
│   ├── src/
│   │   ├── components/    ← ui/ (generic) + shared/ (app-specific)
│   │   ├── pages/         ← Route-level components
│   │   ├── store/         ← Zustand stores (one per domain)
│   │   ├── hooks/         ← Custom React hooks
│   │   ├── services/      ← API calls (never fetch in components)
│   │   ├── types/         ← Shared TypeScript interfaces
│   │   └── utils/         ← Pure helper functions
│   └── e2e/               ← Playwright tests
├── backend/               ← NestJS API (Modular Monolith)
│   ├── CLAUDE.md          ← Backend-specific rules
│   └── src/
│       ├── modules/       ← Feature modules (auth, users, catalog, orders...)
│       ├── shared/        ← Guards, interceptors, filters, pipes
│       └── config/        ← Typed env config + validation
├── openspec/              ← OpenSpec artifacts
│   ├── specs/             ← Living system documentation (archived specs)
│   └── changes/           ← Active changes (proposals, designs, tasks)
└── .beads/                ← Beads task database (Dolt-backed)
```

### Key Architecture Decisions

- **Frontend**: Zustand for client state, TanStack Query for server state, never mix them
- **Backend**: Modular Monolith — modules never import each other's repositories, cross-module via events
- **Database**: PostgreSQL (source of truth) + Redis (cache + queues) + Prisma ORM
- **API responses**: Standardized shape `{ data, meta?, message? }`
- **Money**: Stored as integers (smallest unit), displayed via `dinero.js`

---

## Conventions & Patterns

### Git

- **Always `git pull` first** — before creating a branch or starting any work, pull the latest `main`
- **Branch naming**: `feature/<name>`, `fix/<name>`, `chore/<name>`
- **Commit style**: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Include Beads ID**: `feat: add product listing (nretail-abc)`
- **Always rebase** before merge, no merge commits
- **Never force push** to main
- **Never commit** `.env`, credentials, or secrets
- **NEVER push directly to `main`** — always work on a feature branch; branch protection (Ruleset) blocks direct pushes
- **Always open a PR** to merge into `main` — required CI checks must pass before merging
- **Delete the branch** after the PR is merged

### CI/CD

#### GitHub Actions

Two workflows in `.github/workflows/`:

| Workflow | File | Triggers on | Jobs |
|---|---|---|---|
| **Miniapp CI** | `miniapp.yml` | All PRs/pushes to `main` | `ci / build` (tsc --noEmit), `ci / lint` (prettier --check), `ci / test` (vitest) |
| **Backend CI** | `backend.yml` | PRs/pushes to `main` touching `backend/**` | `test` (lint + unit + integration) |

**Miniapp CI — important notes:**
- Uses **Node 24** — must match the local dev Node version so `npm ci` reads the lock file correctly. If the lock file is regenerated locally with a different Node version, CI will fail with `npm ci` sync errors.
- `zmp build` is **not used** in CI — it requires Zalo credentials. Type checking is done via `tsc --noEmit` instead.
- All three jobs (`ci / build`, `ci / lint`, `ci / test`) always run on every PR, but skip actual work when no `miniapp/**` files changed. This ensures they always report a result to satisfy GitHub's required status checks.
- Job names must exactly match the required check names in the branch Ruleset (`ci / build`, `ci / lint`, `ci / test` with spaces around `/`).

**Backend CI — important notes:**
- Only runs when `backend/**` or `.github/workflows/backend.yml` files change (path filter in `on:` trigger).
- Uses Node 22 to match the backend's `.nvmrc` / runtime.

#### Branch Protection (Ruleset)

`main` is protected via a GitHub **Ruleset** (not classic branch protection). Key rules:
- Direct pushes blocked — all changes must go through a PR
- Required status checks: `ci / build`, `ci / lint`, `ci / test` (miniapp jobs) — must all pass before merge
- Required approvals: **0** — solo repo, self-merge allowed without approval

> **Ruleset vs classic:** The protection uses the newer Rulesets API (`/repos/{owner}/{repo}/rulesets`), not the classic branch protection API (`/branches/main/protection`). The classic API returns 404 — use `gh api repos/lv7dev/nRetail/rulesets` to inspect.

#### Render Deployment

The backend service (`nRetail` on Render, `rootDir: backend`) auto-deploys from `main`.

- **Auto-deploy trigger**: set to **"Yes" (on every push)** — deploys on every merge to `main` regardless of which files changed.
- **Do NOT set to "When checks pass"** — the backend CI only runs when `backend/**` files change. For non-backend PRs, the backend CI never runs and never reports, so Render would wait forever.
- Render dashboard: https://dashboard.render.com/web/srv-d76c5loule4c73er4er0/settings

### Code Style

- **Prettier**: Single `.prettierrc` at repo root applies to all files in both apps — no per-app overrides
- **Ignore**: `.prettierignore` at repo root excludes `node_modules/`, `dist/`, generated files, lock files
- **Miniapp**: Tailwind utility classes, default exports for components
- **Backend**: ESLint + Prettier (`npm run lint`), `class-validator` on all DTOs
- **Path aliases**: `@/*` → `./src/*` (miniapp)
- **TypeScript**: Strict mode in both apps
- **Auto-format**: After using `Edit` or `Write` on any `.ts`, `.tsx`, or `.js` file, run `npx prettier --write <filepath>`

### Testing

- **Miniapp tests**: Co-located as `*.test.tsx` next to source files (Vitest)
- **Backend tests**: In `__tests__/` folders as `*.spec.ts` (Jest)
- **E2E tests**: Playwright in `miniapp/e2e/`
- **TDD enforced by Superpowers**: Write failing test first, always

### File Organization

- One Zustand store per domain (`store/useCartStore.ts`)
- One NestJS module per domain (`modules/products/`)
- All API calls go through `services/` — never fetch in components
- DTOs always validated with `class-validator` + `@ApiProperty()`
