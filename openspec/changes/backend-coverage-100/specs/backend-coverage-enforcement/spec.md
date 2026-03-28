## ADDED Requirements

### Requirement: 100% Jest coverage threshold enforcement
The test suite SHALL enforce 100% coverage across all four metrics (statements, branches, functions, lines) via `coverageThreshold` in `package.json`. Any uncovered line, branch, function, or statement SHALL cause `npm run test:cov` to exit non-zero.

#### Scenario: All coverage metrics pass at 100%
- **WHEN** `npm run test:cov` is run and all covered files meet 100% statements, branches, functions, and lines
- **THEN** the command exits with code 0

#### Scenario: Any metric falls below 100%
- **WHEN** `npm run test:cov` is run and any single metric (e.g. branches) falls below 100% in any covered file
- **THEN** the command exits with non-zero code and prints a coverage threshold failure message

### Requirement: Istanbul phantom branch suppression via ignore annotations
TypeScript decorator metadata compilation emits `__metadata` helper code containing conditional branches that are architecturally unreachable at test time. These phantom branches SHALL be suppressed with `/* istanbul ignore next */` annotations placed immediately before the emitting constructor or class property declaration. No other mechanism (e.g. excluding files, V8 provider) SHALL be used to suppress phantom branches.

#### Scenario: Constructor with NestJS decorators compiles phantom branches
- **WHEN** a class has NestJS constructor-injected dependencies and `emitDecoratorMetadata: true`
- **THEN** the constructor declaration is preceded by `/* istanbul ignore next */` so Istanbul skips the phantom `__metadata` branch

#### Scenario: Annotation survives TypeScript compilation
- **WHEN** ts-jest compiles a source file containing `/* istanbul ignore next */`
- **THEN** the annotation is preserved in the compiled output because the ts-jest transform overrides `removeComments: false`

### Requirement: Real logic gaps closed by unit tests
Every reachable code path in production source files SHALL be exercised by at least one unit test. Istanbul ignore annotations SHALL NOT be used to suppress real, reachable branches — only to suppress phantom TypeScript-emitted branches.

#### Scenario: Plain-string HttpException handled by filter
- **WHEN** an `HttpException` is thrown with a plain string message (not an object response)
- **THEN** `HttpExceptionFilter` returns the correct status code and a response body containing the string as the message

#### Scenario: HttpException with object missing message field
- **WHEN** an `HttpException` is thrown with an object response that has no `message` field
- **THEN** `HttpExceptionFilter` falls back to `exception.message` as the response message

#### Scenario: ValidationError with no constraints field
- **WHEN** `ValidationPipe` processes a ValidationError whose `constraints` field is undefined or null
- **THEN** the error message defaults to `'unknown'` and no runtime error is thrown

#### Scenario: extractConstraintParams called with no target constructor
- **WHEN** `extractConstraintParams` is called with a ValidationError that has no `target` property
- **THEN** the function returns the constraint params without throwing and defaults appropriately

#### Scenario: extractConstraintParams called with no matching metadata
- **WHEN** `extractConstraintParams` is called with a constraint key that has no corresponding metadata entry
- **THEN** the function returns an empty params object without throwing

#### Scenario: compareOtp invoked with matching OTP
- **WHEN** `AuthService.compareOtp` is called with the plaintext OTP and its bcrypt hash
- **THEN** it resolves to `true` using real bcrypt comparison (not mocked)
