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
bd close <id>         # Complete work
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
   git push
   git status  # MUST show "up to date with origin"
   ```
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
bd ready → claim task → /opsx:propose → implement with TDD → /opsx:verify → bd close → git push
```

### Rules

- **Planning**: Use OpenSpec (`/opsx:propose`, `/opsx:explore`) for specs and plans — NOT Superpowers' deprecated `/write-plan`
- **Task tracking**: Use Beads (`bd create`, `bd ready`, `bd close`) — NOT TodoWrite or markdown TODOs
- **TDD**: Superpowers enforces this automatically — no need to request it
- **Code review**: Superpowers dispatches reviewer subagents automatically
- **Specs live in**: `openspec/changes/<name>/` (active) and `openspec/specs/` (archived)
- Link Beads issues to OpenSpec: `bd update <id> --spec-id "openspec/changes/<name>"`
- Include Beads issue ID in commits: `feat: add dark mode (nretail-xxx)`

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
npm install              # Install dependencies
npm run start            # Dev server (zmp start, localhost:3000)
npm run test             # Unit/component tests (Vitest)
npm run test -- path/to/file.test.tsx  # Run single test file
npx playwright test      # E2E tests
npx playwright test --ui # E2E tests with interactive UI
```

### Backend

```bash
cd backend
npm install              # Install dependencies
npm run start:dev        # Dev server with hot reload (port 3000)
npm run build            # Compile to dist/
npm run lint             # ESLint + Prettier auto-fix
npm run test             # Unit tests (Jest)
npm run test:cov         # Tests with coverage
npm run test:e2e         # End-to-end tests
```

### Quality Gates (run before closing a session)

```bash
cd miniapp && npm run test && cd ../backend && npm run test && npm run lint
```

---

## Architecture Overview

### Monorepo Structure

```
nRetail/
├── CLAUDE.md              ← You are here (root project rules)
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

- **Branch naming**: `feature/<name>`, `fix/<name>`, `chore/<name>`
- **Commit style**: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Include Beads ID**: `feat: add product listing (nretail-abc)`
- **Always rebase** before merge, no merge commits
- **Never force push** to main
- **Never commit** `.env`, credentials, or secrets

### Code Style

- **Miniapp**: Prettier (via Vite), Tailwind utility classes, default exports for components
- **Backend**: ESLint + Prettier (`npm run lint`), `class-validator` on all DTOs
- **Path aliases**: `@/*` → `./src/*` (miniapp)
- **TypeScript**: Strict mode in both apps

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
