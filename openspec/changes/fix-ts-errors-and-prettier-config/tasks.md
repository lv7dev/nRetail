## 1. TypeScript Config Fixes

- [ ] 1.1 Add `"es2018"` to the `lib` array in `miniapp/tsconfig.json` — fixes `Promise.prototype.finally` error in `axios.ts:70`
- [ ] 1.2 Install `@types/node` as devDependency in `miniapp/` (`npm install --save-dev @types/node`)
- [ ] 1.3 Create `miniapp/e2e/tsconfig.json` extending root tsconfig, with `types: ["node", "@playwright/test"]` and `include: ["./**/*.ts"]`
- [ ] 1.4 Verify `miniapp/tsconfig.json` has `"include": ["src"]` (not e2e) — confirm node types do NOT leak into src

## 2. Auth Schema Fixes

- [ ] 2.1 Remove `z.preprocess` from `miniapp/src/pages/auth/login/schema.ts` — replace with plain `z.string()`
- [ ] 2.2 Remove `z.preprocess` from `miniapp/src/pages/auth/register/schema.ts` — all fields
- [ ] 2.3 Remove `z.preprocess` from `miniapp/src/pages/auth/forgot-password/schema.ts`
- [ ] 2.4 Verify `npm run test` passes after schema changes (unit tests for these pages must still pass)

## 3. E2E Fixture Fixes

- [ ] 3.1 Fix `miniapp/e2e/fixtures/auth.ts:104` — cast tuple arg as `[string, string]` to resolve Playwright `page.evaluate` overload error
- [ ] 3.2 Fix `miniapp/e2e/global-setup.ts:13` — replace `require('pg')` with `import { Client } from 'pg'`

## 4. Prettier Config

- [ ] 4.1 Create root `.prettierrc` with: `singleQuote: true`, `trailingComma: "all"`, `semi: true`, `printWidth: 100`, `tabWidth: 2`
- [ ] 4.2 Delete `backend/.prettierrc` (absorbed by root config)
- [ ] 4.3 Install `prettier` as devDependency in `miniapp/` (`npm install --save-dev prettier`)
- [ ] 4.4 Add `"format": "prettier --write \"src/**/*.{ts,tsx}\" \"e2e/**/*.ts\""` script to `miniapp/package.json`
- [ ] 4.5 Run `npm run format` in `miniapp/` and `cd backend && npm run format` to apply root config — commit as a standalone formatting commit

## 5. Auto-format Rule in CLAUDE.md

- [ ] 5.1 Add rule to root `CLAUDE.md` Conventions section: after using Edit or Write on any `.ts`, `.tsx`, or `.js` file, run `npx prettier --write <filepath>`

## 6. Verify

- [ ] 6.1 Run `cd miniapp && npx tsc --noEmit` — zero errors
- [ ] 6.2 Run `cd miniapp && npm run test` — all unit tests pass
- [ ] 6.3 Confirm `npx tsc --noEmit --project e2e/tsconfig.json` runs without error in miniapp
