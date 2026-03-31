# Outlets Module

Manages the relationship between users and their assigned retail outlets. Provides authenticated users with the list of outlets they can operate in.

## Responsibility

- Return the list of outlets a user is a member of, including their role in each
- Other modules consuming outlet membership should import `OutletsService` — never `OutletsRepository`

**Not responsible for:** creating/editing/deleting outlets (admin concern), assigning users to outlets, or enforcing outlet-level authorization on other modules.

## Files

```
modules/outlets/
├── outlets.module.ts           # Imports PrismaModule (global), exports OutletsService
├── outlets.controller.ts       # GET /outlets/mine — protected by JwtAuthGuard
├── outlets.service.ts          # Business logic: thin delegation to repository
├── outlets.repository.ts       # All Prisma queries
├── dto/
│   └── my-outlet.response.ts  # Response shape: id, name, address, role
└── __tests__/
    ├── outlets.controller.spec.ts
    ├── outlets.service.spec.ts
    └── outlets.repository.spec.ts
```

## API

```
GET /outlets/mine    → MyOutletResponse[]   (requires JWT)
```

Response shape:
```json
{
  "data": [
    { "id": "clxyz123", "name": "Main Store", "address": "123 Nguyen Hue, Q1", "role": "OWNER" },
    { "id": "clabc456", "name": "Branch Store", "address": null, "role": "STAFF" }
  ]
}
```

## OutletsService Methods

| Method          | Signature                               | Used by                 |
|-----------------|-----------------------------------------|-------------------------|
| `getMyOutlets`  | `(userId: string) → MyOutletResponse[]` | `OutletsController`     |

## Data Model

Outlets use a many-to-many join through `UserOutlet`:

```
User ──── UserOutlet ──── Outlet
             role: OutletRole (OWNER | MANAGER | STAFF)
             @@unique([userId, outletId])
```

`OutletRole` is a per-membership role distinct from `User.role` (which is a platform-level role: `ADMIN` | `CUSTOMER`).

## TypeScript Note

`User` from `@prisma/client` must be imported with `import type` in decorated method signatures:

```ts
// outlets.controller.ts — correct
import type { User } from '@prisma/client';

@Get('mine')
@UseGuards(JwtAuthGuard)
getMyOutlets(@CurrentUser() user: User): Promise<MyOutletResponse[]> { ... }
```

Using a value import (`import { User }`) triggers TS1272 under `isolatedModules` + `emitDecoratorMetadata`. See root `backend/CLAUDE.md` for full explanation.
