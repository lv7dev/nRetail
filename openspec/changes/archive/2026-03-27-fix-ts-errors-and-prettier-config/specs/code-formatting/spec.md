## ADDED Requirements

### Requirement: Shared Prettier configuration at monorepo root
A single `.prettierrc` file at the repository root SHALL define the formatting rules for all TypeScript, JavaScript, TSX, and JSX files across both `miniapp/` and `backend/`. The backend's `backend/.prettierrc` SHALL be removed so that Prettier's config resolution falls through to the root file.

#### Scenario: Root config is found for miniapp files
- **WHEN** Prettier runs on any file under `miniapp/src/`
- **THEN** it SHALL apply the root `.prettierrc` rules (`singleQuote: true`, `trailingComma: "all"`, `semi: true`, `printWidth: 100`, `tabWidth: 2`)

#### Scenario: Root config is found for backend files
- **WHEN** Prettier runs on any file under `backend/src/`
- **THEN** it SHALL apply the same root `.prettierrc` rules

#### Scenario: No per-app override exists
- **WHEN** a file under `miniapp/` or `backend/` is formatted
- **THEN** there SHALL be no `backend/.prettierrc` or `miniapp/.prettierrc` that overrides the root config

### Requirement: Prettier installed as miniapp devDependency
The `miniapp/package.json` SHALL include `prettier` as a devDependency so that `npx prettier` resolves to the pinned version.

#### Scenario: prettier available in miniapp
- **WHEN** a developer runs `npx prettier --write src/app.tsx` from `miniapp/`
- **THEN** the command SHALL succeed without installing a temporary version

### Requirement: Format script in miniapp
The `miniapp/package.json` SHALL include a `format` script that formats all TypeScript and TSX source files.

#### Scenario: Format script runs
- **WHEN** `npm run format` is executed in `miniapp/`
- **THEN** Prettier SHALL write formatted output to all `src/**/*.{ts,tsx}` and `e2e/**/*.ts` files

### Requirement: Claude auto-formats edited files
After Claude edits or creates any `.ts`, `.tsx`, or `.js` file in the project, it SHALL run `npx prettier --write <filepath>` on that file before finishing the task.

#### Scenario: File edited by Claude is auto-formatted
- **WHEN** Claude uses the Edit or Write tool on a `.ts`, `.tsx`, or `.js` file
- **THEN** Claude SHALL run `npx prettier --write <filepath>` immediately after
- **AND** the committed file SHALL conform to the root `.prettierrc` rules
