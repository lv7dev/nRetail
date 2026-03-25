# tsconfig-module-resolution

## Requirement: tsconfig uses bundler-compatible module resolution
`miniapp/tsconfig.json` SHALL use `"moduleResolution": "bundler"` and SHALL NOT contain `"ignoreDeprecations"`.

### Scenario: TypeScript type-check passes
- **WHEN** `tsc --noEmit` is run in the `miniapp/` directory
- **THEN** it exits with code 0 and no errors

### Scenario: No editor errors in tsconfig.json
- **WHEN** VS Code opens `miniapp/tsconfig.json` with its bundled TypeScript
- **THEN** no squiggles or diagnostics appear on any line
