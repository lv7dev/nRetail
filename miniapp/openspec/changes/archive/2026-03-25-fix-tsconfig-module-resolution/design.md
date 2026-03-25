## Context

`miniapp/tsconfig.json` uses `"moduleResolution": "node"` — a legacy TypeScript option that was deprecated in 5.x and no longer appropriate for modern bundler-based projects. A workaround (`"ignoreDeprecations": "6.0"`) was added to suppress the resulting error, but this value is only recognized by TypeScript 6.x, causing VS Code (which uses its own bundled 5.x TypeScript) to report an editor error.

## Goals / Non-Goals

**Goals:**
- Remove the deprecated `moduleResolution: "node"` option
- Remove the `ignoreDeprecations` workaround that masked it
- Leave `tsc --noEmit` passing with no errors

**Non-Goals:**
- Upgrading or downgrading TypeScript version
- Changing any other tsconfig options
- Touching source files

## Decisions

### Use `"moduleResolution": "bundler"` over `"node16"` / `"nodenext"`

`"bundler"` is the correct setting for Vite-based projects. It matches how Vite resolves modules (without requiring `.js` extensions on imports) and is the recommended setting in the Vite + TypeScript docs.

`"node16"` / `"nodenext"` target Node.js ESM resolution, which enforces explicit file extensions — unnecessarily strict for a frontend bundler project.

## Risks / Trade-offs

- **[Risk]** `"bundler"` moduleResolution requires `"module"` to be `"esnext"` or `"preserve"` → Already satisfied (`"module": "esnext"` on line 6). No change needed.
- **[Risk]** Zalo platform imports could behave differently → `zmp-sdk` / `zmp-ui` / `zmp-vite-plugin` are all standard npm packages; module resolution change does not affect runtime behavior, only TypeScript's type-checking import resolution.
