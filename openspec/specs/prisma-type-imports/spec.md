## ADDED Requirements

### Requirement: Prisma model types SHALL NOT be imported directly from @prisma/client
With `"moduleResolution": "nodenext"` in `tsconfig.json`, importing model types such as `User`, `RefreshToken`, `OtpVerification`, or `PhoneConfig` directly from `@prisma/client` fails at compile time with `TS2305: Module '@prisma/client' has no exported member 'User'`.

The root cause: Prisma v7 generates model types inside `node_modules/.prisma/client/index.d.ts`. The `@prisma/client/default.d.ts` re-exports them via `export * from '.prisma/client/default'` — a relative path that does not resolve correctly under `nodenext` module resolution because `.prisma/` does not exist inside `node_modules/@prisma/client/`.

**Prohibited pattern:**
```ts
import { User } from '@prisma/client'; // ✗ TS2305 under nodenext
```

**Required pattern — let TypeScript infer from PrismaService:**
```ts
// Repository — no explicit return type; Prisma infers it
findById(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}

// Service — propagate inference from repository
findById(id: string) {
  return this.usersRepository.findById(id);
}
```

**When a concrete type is required** (e.g. a service method parameter), define a minimal local interface:
```ts
interface UserRecord {
  id: string;
  phone: string;
  role: string;
}
```
Export the interface if the controller's inferred return type references it (prevents `TS4053`).

#### Scenario: Repository returns a Prisma model
- **WHEN** a repository method queries the database via `PrismaService`
- **THEN** the return type SHALL be inferred from the Prisma call, not annotated with an imported model type

#### Scenario: Service delegates to a repository
- **WHEN** a service method calls a repository method
- **THEN** the return type SHALL propagate via TypeScript inference without explicit Prisma type annotations

---

### Requirement: Prisma model types SHALL NOT be used in decorated NestJS method signatures
Using a Prisma model type as the annotated type of a decorated parameter (e.g. `@Body()`, `@Param()`, `@CurrentUser()`) triggers `TS1272: A type referenced in a decorated signature must be imported with 'import type'` when `isolatedModules` and `emitDecoratorMetadata` are both enabled. Even with `import type`, the decorator metadata cannot emit a type-only import at runtime.

**Prohibited pattern:**
```ts
import { User } from '@prisma/client';

// ✗ TS1272 — emitDecoratorMetadata cannot emit User as runtime type
me(@CurrentUser() user: User): User { ... }
```

**Required pattern — use `unknown` or a local interface:**
```ts
// ✓ No Prisma type in decorated signature
me(@CurrentUser() user: unknown) {
  return user;
}
```

#### Scenario: Controller method uses @CurrentUser() decorator
- **WHEN** a controller method is annotated with `@CurrentUser()` or any custom param decorator
- **THEN** the parameter type SHALL be `unknown` or a locally defined interface, never a Prisma model type

---

### Requirement: Safe imports from @prisma/client
The following imports from `@prisma/client` ARE safe under `nodenext` and SHALL be used when needed:

- **`Role` enum** — a runtime value, exports correctly: `import { Role } from '@prisma/client'`
- **`Prisma` namespace** — a runtime object, exports correctly: `import { Prisma } from '@prisma/client'`
- **`PrismaClient` class** — a runtime class, exports correctly: `import { PrismaClient } from '@prisma/client'`

#### Scenario: Using the Role enum in a DTO or entity
- **WHEN** a DTO or service needs to reference the `Role` enum value
- **THEN** `import { Role } from '@prisma/client'` SHALL be used (safe — it is a runtime value)

#### Scenario: Using the Prisma namespace for utility types
- **WHEN** a utility type from the Prisma namespace is needed
- **THEN** `import { Prisma } from '@prisma/client'` SHALL be used (safe — it is a runtime object)
