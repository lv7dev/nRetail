## Why

The miniapp codebase has accumulated four TypeScript compiler errors (tsconfig lib gaps, missing node types in e2e/, z.preprocess poisoning resolver types, and a Playwright tuple mismatch) that block type-safe development. There is also no shared Prettier config — the backend has a minimal one, the miniapp has none — causing inconsistent formatting across the monorepo and no automatic formatting on file edit.

## What Changes

- Add `es2018` to `miniapp/tsconfig.json` `lib` array so `Promise.prototype.finally` is recognised
- Add `e2e/tsconfig.json` that extends the root tsconfig, adds `@types/node`, and covers the `e2e/` folder
- Replace `z.preprocess(v => v ?? '', z.string()...)` with plain `z.string()...` in all three auth schemas (`login`, `register`, `forgot-password`) to restore correct resolver input types
- Fix `page.evaluate` tuple argument cast in `e2e/fixtures/auth.ts` (`as [string, string]`)
- Replace `require('pg')` with ESM `import` in `e2e/global-setup.ts`
- Add a root `.prettierrc` shared by both apps (absorbs backend's current config, adds `semi`, `printWidth`, `tabWidth`)
- Install `prettier` as devDependency in `miniapp/`
- Add `format` script to `miniapp/package.json`
- Add auto-format rule to root `CLAUDE.md`: Claude must run `npx prettier --write <file>` after editing any `.ts`, `.tsx`, `.js` file

## Capabilities

### New Capabilities

- `code-formatting`: Shared Prettier configuration and auto-format rule for Claude Code sessions

### Modified Capabilities

- `frontend-integration-testing`: `e2e/tsconfig.json` is new infrastructure for the E2E test layer; the node types requirement is a gap in the existing spec
- `pure-tdd-discipline`: Auto-format rule on edit is part of the code quality discipline the spec established

## Impact

- `miniapp/tsconfig.json` — lib array update (no breaking change)
- `miniapp/e2e/tsconfig.json` — new file
- `miniapp/src/pages/auth/login/schema.ts`, `register/schema.ts`, `forgot-password/schema.ts` — remove `z.preprocess`
- `miniapp/e2e/fixtures/auth.ts:104` — cast fix
- `miniapp/e2e/global-setup.ts:13` — ESM import
- `.prettierrc` (root) — new file; `backend/.prettierrc` can be removed in favour of root
- `miniapp/package.json` — add prettier devDependency + format script
- `CLAUDE.md` (root) — add auto-format instruction
