## Context

The miniapp `tsconfig.json` was bootstrapped for Vite/browser code and has accumulated gaps: `lib` stops at ES2017 (missing `Promise.finally`), `e2e/` is outside its `include` scope, and `@types/node` is not declared. Auth schemas use `z.preprocess` to guard against null inputs from react-hook-form, which was unnecessary and makes the resolver input type `unknown` instead of `string`. The monorepo has no shared Prettier config — the backend has a 2-line one, miniapp has none — so formatting is inconsistent and cannot be automated.

## Goals / Non-Goals

**Goals:**
- Zero TypeScript errors in `src/` and `e2e/` without disabling type checking
- Shared Prettier config at monorepo root inherited by both apps
- Claude Code auto-formats any `.ts`/`.tsx`/`.js` file it edits

**Non-Goals:**
- Enforcing Prettier via CI (a separate concern — linting pipeline)
- Changing ESLint configuration
- Altering runtime behaviour of any component or service

## Decisions

### D1 — Separate `e2e/tsconfig.json` rather than expanding root

E2E files target Node (not browser), need `@types/node`, and use `@playwright/test` globals instead of `vitest/globals`. Merging these into the single `tsconfig.json` would expose Node globals in browser code and muddy type boundaries. A dedicated `e2e/tsconfig.json` extending the root keeps concerns separate.

```
miniapp/
├── tsconfig.json          ← browser/src only: dom, vitest/globals
└── e2e/
    └── tsconfig.json      ← extends .., adds: node types, includes e2e/**
```

### D2 — Drop `z.preprocess` from all auth schemas

`z.preprocess(v => v ?? '', z.string())` was added defensively to handle potential null values from react-hook-form. But react-hook-form always provides strings for text inputs — the preprocess is never triggered. Its only effect is changing the inferred input type from `string` to `unknown`, which breaks the zodResolver type contract. Plain `z.string().min/regex` is correct and type-safe.

Alternative considered: keep preprocess but cast the schema type manually. Rejected — it hides the real type and makes schema inference untrustworthy.

### D3 — Root `.prettierrc` replaces `backend/.prettierrc`

A single `.prettierrc` at repo root is picked up by Prettier's config resolution for all files in the monorepo. The backend's current `backend/.prettierrc` would be deleted; its settings (`singleQuote: true, trailingComma: "all"`) are preserved in the root config along with additions (`semi: true, printWidth: 100, tabWidth: 2`).

Prettier config additions chosen to match existing code style observed in both apps — no reformatting surprises.

### D4 — Auto-format rule in root CLAUDE.md

Adding the instruction to root `CLAUDE.md` (not app-level files) ensures it applies in any session regardless of which working directory Claude operates in. The rule is: after using `Edit` or `Write` on any `.ts`, `.tsx`, or `.js` file, run `npx prettier --write <filepath>`.

## Risks / Trade-offs

- **`z.preprocess` removal may surface latent bugs** → If any schema field somehow received null at runtime (not through react-hook-form), validation would now fail with a type error instead of silently coercing. This is the desired behaviour — fail loudly rather than silently pass nulls through.
- **Root .prettierrc reformats entire codebase on next `npm run format`** → This is a one-time diff noise. Run format as a single separate commit to keep history clean.
- **`e2e/tsconfig.json` must be referenced in `playwright.config.ts`** → Playwright uses its own type resolution; the tsconfig path should be verified to avoid phantom type errors in the Playwright test runner.
