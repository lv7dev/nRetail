## Context

The backend Jest suite uses Istanbul (the default Jest coverage provider) with `ts-jest` for TypeScript compilation. The main `tsconfig.json` sets `"removeComments": true` and `"emitDecoratorMetadata": true`.

When TypeScript compiles a class with decorators and `emitDecoratorMetadata: true`, it injects a `__metadata` helper at each constructor and decorated property:

```js
__metadata("design:type", typeof (_a = typeof SomeType !== "undefined" && SomeType) === "function" ? _a : Object)
```

Istanbul instruments this as a branch: `typeof SomeType !== "undefined"` → true/false. In practice the false branch is architecturally unreachable — NestJS always imports the real type before any test runs. Istanbul reports it as an uncovered branch.

With `removeComments: true`, any `/* istanbul ignore next */` comments are stripped by `tsc` before Istanbul ever sees the source map, making the standard ignore annotation ineffective. The fix is to override `removeComments` only in the ts-jest transform — this does not affect the production build.

Current state: `statements: 98, branches: 80, functions: 98, lines: 99`.
Target state: all four metrics at `100`.

## Goals / Non-Goals

**Goals:**
- All four Jest coverage metrics reach exactly 100%.
- Phantom branches (Istanbul artifacts from decorator metadata) are suppressed via `/* istanbul ignore next */` on the emitting constructor/property.
- Real logic gaps (previously untested branches in filter, pipe, utils, service) are closed by adding test cases.
- The ts-jest `removeComments: false` override makes annotations survivable through compilation.
- CLAUDE.md documents this pattern for future contributors.

**Non-Goals:**
- Switching coverage provider to V8 — V8 requires `new Dto()` for class coverage, which breaks our existing DTO test strategy.
- Adding integration tests for the newly-tested paths — unit tests are sufficient for pure branch coverage on these internal utilities.
- 100% coverage for files already in `coveragePathIgnorePatterns` (boilerplate is correctly excluded).

## Decisions

### Decision 1: Istanbul + `removeComments: false` override, not V8

**Rationale:** V8 was evaluated experimentally. V8 marks coverage at runtime bytecode level, not source-map level. For TypeScript classes, V8 only marks a class as covered when an instance is constructed (`new Dto()`). Our existing DTO unit tests do not instantiate DTOs — they test controller/service behavior with DTOs validated by the pipe. Switching to V8 dropped DTO coverage from 100% → 41–78% statements, 0% branches. Istanbul marks coverage at module load, so DTOs compiled and imported by test files are already covered.

**Alternative considered:** Write `new CreateUserDto()` in each DTO test file. Rejected — this adds noise and couples test structure to coverage provider semantics. Istanbul is better aligned with NestJS testing patterns.

**Resolution:** Stay on Istanbul. Fix the `removeComments` problem at the ts-jest transform level.

### Decision 2: `/* istanbul ignore next */` on phantom constructors, not source-level `if` guards

**Rationale:** The phantom branches live in TypeScript-emitted helper code, not in authored code. Adding source-level guards would be misleading. The correct tool is the Istanbul ignore annotation on the line that generates the phantom branch — the constructor declaration or the decorated property.

**Placement rule:** Add `/* istanbul ignore next */` on the line *immediately before* the constructor body opening brace (or the class property line), so Istanbul ignores the phantom `__metadata` branch emitted for that constructor.

### Decision 3: Close real gaps with targeted unit tests, not `/* istanbul ignore next */`

**Rationale:** The 5–6 uncovered branches are real untested paths, not artifacts:
- `http-exception.filter`: plain string HttpException + `payload.message ?? exception.message` fallback
- `validation.pipe`: `err.constraints` null path
- `extract-constraint-params`: no-target-constructor path, no-matching-meta path
- `auth.service.compareOtp`: real bcrypt comparison (always mocked in existing tests)

These should be tested, not suppressed. Using `/* istanbul ignore next */` here would hide real coverage deficiencies.

### Decision 4: `compareOtp` tested with real bcrypt, not another spy

**Rationale:** All existing `compareOtp` call-sites mock `jest.spyOn(service as any, 'compareOtp')` — the private method body is never exercised. Adding one test that passes a real OTP through the actual bcrypt comparison closes the gap without restructuring the test suite. The ~200ms bcrypt cost is acceptable in a targeted single test.

## Risks / Trade-offs

- **`removeComments: false` in ts-jest only**: The production build still strips comments. The override applies only to the test transform. This is intentional and safe — no runtime impact.
- **Phantom branch locations may shift with NestJS upgrades**: If NestJS updates its decorator patterns or TypeScript changes `emitDecoratorMetadata` output format, new phantom branches may appear. Mitigation: `npm run test:cov` will catch them immediately (threshold enforces 100%).
- **bcrypt in unit test suite**: The `compareOtp` direct test calls real bcrypt (~200ms). This is a small and one-time cost. If it becomes a flakiness concern, the test can be moved to integration tier.
- **Annotation maintenance burden**: Every new class with NestJS decorators needs a `/* istanbul ignore next */` annotation on its constructor. This is documented in CLAUDE.md to prevent future coverage failures.

## Migration Plan

1. Add `"tsconfig": { "removeComments": false }` to the ts-jest transform in `package.json`.
2. Add `/* istanbul ignore next */` to all phantom constructor/property locations.
3. Add 5–6 targeted unit tests for real gaps.
4. Run `npm run test:cov` and verify 100% across all metrics.
5. Set `coverageThreshold` to `{ global: { statements: 100, branches: 100, functions: 100, lines: 100 } }`.
6. Run `npm run lint` and fix any linting issues in new/modified files.
7. Update `backend/CLAUDE.md` with the Istanbul ignore pattern documentation.

Rollback: revert the threshold change in `package.json`. All other changes are additive (test files + ignore annotations) and can remain.

## Open Questions

- None — the approach is fully validated by the explore session. The V8 experiment confirmed Istanbul is correct; `removeComments: false` is the right fix.
