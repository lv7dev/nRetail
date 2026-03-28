## ADDED Requirements

### Requirement: Coverage exclusion for boilerplate files
The Jest unit test config SHALL exclude files with no testable logic from coverage collection via `coveragePathIgnorePatterns`.

#### Scenario: Boilerplate files do not appear in coverage report
- **WHEN** `npm run test:cov` is executed
- **THEN** `main.ts`, `*.module.ts`, `config/config.schema.ts`, and `config/configuration.ts` do not appear in the coverage table

### Requirement: Coverage threshold enforced in CI
The Jest config SHALL define a `coverageThreshold` that fails the run if global coverage drops below the configured minimum.

#### Scenario: Coverage below threshold fails the run
- **WHEN** `npm run test:cov` is executed and statement coverage is below the threshold
- **THEN** Jest exits with a non-zero status code

#### Scenario: Coverage at or above threshold passes
- **WHEN** `npm run test:cov` is executed and all thresholds are met
- **THEN** Jest exits with status code 0
