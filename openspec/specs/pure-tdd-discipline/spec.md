## ADDED Requirements

### Requirement: Test-first commit order
Every new function, method, or behaviour must have a failing test committed before the implementation that makes it pass. Implementation code for a behaviour must never appear in the codebase before its corresponding test.

#### Scenario: New feature is developed with TDD
- **WHEN** a developer (human or AI) adds a new capability
- **THEN** commit 1 adds a failing test (`test: <what it should do>`), commit 2 adds the minimum implementation (`feat: <implement it>`), and an optional commit 3 refactors without adding behaviour (`refactor: <cleanup>`)

#### Scenario: Bug fix is developed with TDD
- **WHEN** a bug is fixed
- **THEN** commit 1 adds a failing test that reproduces the bug (`test: reproduce <bug>`), commit 2 fixes the bug (`fix: <bug description>`)

### Requirement: Test tier assignment
Each test must be placed in the correct tier based on what it exercises. Placing a test in the wrong tier (e.g., an integration test written as a unit test with heavy mocking) is treated as a quality violation.

#### Scenario: Unit test — logic only
- **WHEN** a test covers a pure function, component render, or service method with all dependencies mocked
- **THEN** the test file is named `*.test.tsx` or `*.spec.ts` and runs in the unit tier

#### Scenario: Integration test — HTTP boundary wired
- **WHEN** a test exercises the real axios client (FE) or real NestJS controller + DB (BE)
- **THEN** the test file is named `*.integration.test.tsx` (FE) or `*.integration.spec.ts` (BE) and runs in the integration tier

#### Scenario: E2E test — full user flow
- **WHEN** a test drives a real browser through a complete user-visible flow
- **THEN** the test lives in `e2e/` and runs via Playwright

### Requirement: CLAUDE.md documents the TDD rule
Both `miniapp/CLAUDE.md` and `backend/CLAUDE.md` contain a clearly labelled TDD section that states: (1) the test-first commit rule, (2) the three tiers and their file naming conventions, and (3) the npm scripts to run each tier. The root `CLAUDE.md` quality gates section references all three test commands.

#### Scenario: AI agent starts a new task
- **WHEN** Claude reads CLAUDE.md before implementing a feature
- **THEN** the TDD rule is immediately visible and unambiguous, with the correct commit sequence documented

### Requirement: TypeScript strict mode with correct lib targets
`miniapp/tsconfig.json` SHALL include `es2018` (or later) in its `lib` array so that ES2018 built-ins (`Promise.prototype.finally`, `Object.entries`, etc.) are recognised by the type checker. The `lib` array SHALL NOT be so broad that it introduces types unavailable in the supported browser targets.

#### Scenario: Promise.prototype.finally resolves without error
- **WHEN** any `src/` file calls `.finally()` on a `Promise`
- **THEN** the TypeScript compiler SHALL NOT report "Property 'finally' does not exist on type 'Promise<void>'"

### Requirement: Zod schemas use plain validators without preprocess
Auth form schemas (`login`, `register`, `forgot-password`, `new-password`, `otp`) SHALL define string fields using `z.string()` directly, without wrapping in `z.preprocess`. This ensures the inferred input type is `string`, which is compatible with the `zodResolver` contract expected by `react-hook-form`.

#### Scenario: zodResolver accepts auth schema without type error
- **WHEN** any auth page calls `useForm<FormData>({ resolver: zodResolver(schema) })`
- **THEN** the TypeScript compiler SHALL NOT report a resolver type mismatch

#### Scenario: Form submit handler receives typed data
- **WHEN** `handleSubmit(onSubmit)` is called on a form using an auth schema
- **THEN** `onSubmit` SHALL receive a parameter typed as the schema's output type without a TypeScript error on the handler signature
