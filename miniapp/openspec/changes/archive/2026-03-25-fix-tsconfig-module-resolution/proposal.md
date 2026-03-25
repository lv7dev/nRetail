## Why

`miniapp/tsconfig.json` uses the deprecated `moduleResolution: "node"` option and suppresses the resulting error with `ignoreDeprecations: "6.0"` — a value only TypeScript 6.x understands. VS Code's bundled TypeScript (5.x) reports "Invalid value for '--ignoreDeprecations'" on line 3, causing a persistent editor error. Fixing the root cause removes the workaround entirely.

## What Changes

- Remove `"ignoreDeprecations": "6.0"` from `tsconfig.json`
- Change `"moduleResolution": "node"` → `"moduleResolution": "bundler"` (correct setting for Vite)

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- `miniapp/tsconfig.json` — two option changes, no behavior change for application code
- VS Code editor error on line 3 of tsconfig.json is resolved
- TypeScript type-checking continues to pass (`tsc --noEmit` exits 0)
- No changes to source files, dependencies, or runtime behavior
