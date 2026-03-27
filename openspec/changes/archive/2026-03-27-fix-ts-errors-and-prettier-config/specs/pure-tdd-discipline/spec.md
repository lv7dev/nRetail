## ADDED Requirements

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
