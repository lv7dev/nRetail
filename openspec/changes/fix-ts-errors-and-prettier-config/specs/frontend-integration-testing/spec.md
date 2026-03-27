## ADDED Requirements

### Requirement: E2E folder has its own tsconfig for Node types
`miniapp/e2e/tsconfig.json` SHALL exist, extend the root `tsconfig.json`, include `@types/node` in its types array, and cover the `e2e/` directory. This allows E2E files to use Node APIs (`process.env`, `require`, `import` from `pg`, etc.) without polluting the browser-targeted `src/` tsconfig.

#### Scenario: E2E global-setup uses ESM imports without type errors
- **WHEN** `e2e/global-setup.ts` uses `import { Client } from 'pg'`
- **THEN** the TypeScript compiler SHALL resolve the types without error

#### Scenario: E2E spec files resolve Playwright types
- **WHEN** any file in `e2e/` imports from `@playwright/test`
- **THEN** the types SHALL resolve correctly under `e2e/tsconfig.json`

#### Scenario: Node globals not available in src/
- **WHEN** a file under `src/` references `process.env` or `require`
- **THEN** the TypeScript compiler SHALL NOT resolve these as Node globals (no node types in src tsconfig)
