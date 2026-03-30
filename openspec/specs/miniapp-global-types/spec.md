# miniapp-global-types

Specification for TypeScript type declarations that ensure browser-source code, test mocks, and E2E configuration are all type-safe and properly scoped.

---

## Requirement: Window interface declares APP_CONFIG

The miniapp SHALL have a TypeScript declaration that extends the global `Window` interface with an `APP_CONFIG` property so that `window.APP_CONFIG` access in `app.tsx` is type-safe.

### Scenario: APP_CONFIG property is recognized by the type checker
- **WHEN** TypeScript type-checks `src/app.tsx`
- **THEN** `window.APP_CONFIG` resolves without error (`Property 'APP_CONFIG' does not exist` is not emitted)

### Scenario: APP_CONFIG declaration does not expose Node globals to browser code
- **WHEN** TypeScript type-checks any file under `src/`
- **THEN** `process`, `require`, and other Node globals remain unresolved (no Node types leak from the declaration file)

---

## Requirement: PasswordInput mock uses precise prop types

Test mocks for `PasswordInput` SHALL use `React.InputHTMLAttributes<HTMLInputElement>` (intersected with component-specific props) rather than an `[k: string]: unknown` index signature, so that spreading rest props into a JSX `<input>` element is type-safe.

### Scenario: Spreading rest props into <input> in the mock is accepted by the type checker
- **WHEN** TypeScript type-checks `RegisterComplete.test.tsx`
- **THEN** the `{...props}` spread on the mock `<input>` does not emit `Type 'unknown' is not assignable to type ...`

---

## Requirement: playwright.config.ts is covered by a tsconfig with Node types

`playwright.config.ts` SHALL be included in a TypeScript project that provides `node` and `@playwright/test` type definitions, so that `process.env` access is resolved.

### Scenario: process.env is recognized in playwright.config.ts
- **WHEN** TypeScript type-checks `playwright.config.ts`
- **THEN** `process.env.CI` resolves without error (`Cannot find name 'process'` is not emitted)

### Scenario: Node types do not bleed into browser source code
- **WHEN** TypeScript type-checks any file under `src/`
- **THEN** `process` remains unresolved in browser code (the e2e tsconfig covers only e2e files and playwright.config.ts)
