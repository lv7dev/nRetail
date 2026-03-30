## Context

The miniapp has three locations where TypeScript's type checker cannot resolve types it should know about:

1. `src/app.tsx` reads/writes `window.APP_CONFIG` but `Window` has no such property declared. The only `.d.ts` in `src/` is `vite-env-svgr.d.ts` (SVG module augmentation).
2. `RegisterComplete.test.tsx`'s PasswordInput mock uses `[k: string]: unknown` as an index signature. When spread into a JSX `<input>`, TypeScript traces `unknown` into the `children` prop and rejects it.
3. `playwright.config.ts` sits at `miniapp/` root — outside `src/` (covered by root tsconfig, no Node types) and outside `e2e/` (covered by e2e tsconfig, has Node types). It's effectively orphaned and `process` is unresolved.

## Goals / Non-Goals

**Goals:**
- Make `tsc --noEmit` clean with zero type errors
- Fix IDE red squiggles at the three known locations
- Keep fixes minimal and targeted — no refactoring beyond what's needed

**Non-Goals:**
- Enable `strict: true` on currently-relaxed settings (`noImplicitAny: false`)
- Add Node types to `src/` (browser code should not see Node globals)
- Change any runtime behaviour

## Decisions

### Decision 1 — New `src/global.d.ts` for Window augmentations

**Chosen:** Create `src/global.d.ts` with `declare global { interface Window { APP_CONFIG?: unknown } }`.

Type it as `unknown` rather than the precise `app-config.json` shape. The assignment uses `as any`, and no downstream code reads `window.APP_CONFIG` in a typed way — so `unknown` is accurate and avoids coupling to the JSON schema.

**Alternatives considered:**
- `typeof import('../app-config.json')` — too tight; the JSON shape is config-only and shouldn't leak into the type system
- Inline `(window as any).APP_CONFIG` in app.tsx — hides the problem without naming it; also `noImplicitAny: false` makes this inconsistent

### Decision 2 — Use `React.InputHTMLAttributes<HTMLInputElement>` in the mock

**Chosen:** Change the second generic argument of `forwardRef` in `RegisterComplete.test.tsx` from `{ label?: string; error?: string; [k: string]: unknown }` to `{ label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>`.

This is the correct type for "everything an `<input>` accepts, plus label and error". The `&` intersection naturally covers the spread without an index signature.

**Alternatives considered:**
- `[k: string]: string | number | boolean | undefined` — technically fixes the error but is still an imprecise lie about what props are valid
- Casting inside the render: `{...(props as React.InputHTMLAttributes<HTMLInputElement>)}` — runtime identical but puts the cast in the wrong place (render body vs type declaration)

### Decision 3 — Extend `e2e/tsconfig.json` include

**Chosen:** Add `"../playwright.config.ts"` to the `include` array in `e2e/tsconfig.json`.

`playwright.config.ts` is E2E infrastructure alongside the test files. Grouping it with the e2e tsconfig (which already has `node` + `@playwright/test` types) is the right conceptual home. The root tsconfig intentionally excludes non-`src/` files to keep browser code clean.

**Alternatives considered:**
- `/// <reference types="node" />` in `playwright.config.ts` — works but is file-level noise; the tsconfig approach is authoritative
- Adding `playwright.config.ts` to root tsconfig's include — wrong home; root tsconfig is browser code only

## Risks / Trade-offs

- **`global.d.ts` is a catch-all trap** → Mitigation: keep it minimal; only declare window augmentations that are actually set in `app.tsx`. Document in a comment why each property exists.
- **`e2e/tsconfig.json` include path is relative** → The `../playwright.config.ts` path is stable as long as the project structure doesn't change. Acceptable risk.

## Open Questions

None — all three fixes are well-understood and scoped.
