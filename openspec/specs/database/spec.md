## ADDED Requirements

### Requirement: PrismaService connects to PostgreSQL on startup
`PrismaService` SHALL extend `PrismaClient` and call `$connect()` in `onModuleInit`. It SHALL call `$disconnect()` in `onModuleDestroy`.

#### Scenario: App starts with a valid DATABASE_URL
- **WHEN** the app starts and `DATABASE_URL` points to a reachable PostgreSQL instance
- **THEN** Prisma SHALL connect successfully and log the connection

#### Scenario: DATABASE_URL is unreachable
- **WHEN** the database is unavailable at startup
- **THEN** `PrismaService` SHALL throw an error that propagates to NestJS's bootstrap, preventing the app from starting silently broken

---

### Requirement: DatabaseModule exports PrismaService globally
`DatabaseModule` SHALL be registered with `@Global()` and SHALL export `PrismaService` so any module can inject it without importing `DatabaseModule`.

#### Scenario: Injecting PrismaService in a feature module
- **WHEN** `ProductsRepository` injects `PrismaService`
- **THEN** it SHALL receive the connected client without listing `DatabaseModule` in `ProductsModule`'s imports

---

### Requirement: Prisma schema initialized
`prisma/schema.prisma` SHALL exist with `datasource db` pointing to `env("DATABASE_URL")` and generator set to `prisma-client-js`. No models are required at this stage.

#### Scenario: Running prisma generate
- **WHEN** a developer runs `npx prisma generate`
- **THEN** it SHALL succeed and produce the Prisma client without errors
