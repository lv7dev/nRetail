# Outlets Module

Manages the relationship between users and their assigned retail outlets. Provides authenticated users with their outlet memberships and supports confirming or rejecting membership requests.

## Responsibility

- Return outlets the authenticated user is a `CONFIRMED` member of (`GET /outlets/mine`)
- Return paginated outlet lists filtered by connection status with search and cursor pagination (`GET /outlets`)
- Allow users to confirm or reject a pending outlet membership (`PATCH /outlets/:outletId/membership`)
- Other modules consuming outlet membership should import `OutletsService` — never `OutletsRepository`

**Not responsible for:** creating/editing/deleting outlets (admin concern), assigning users to outlets, or enforcing outlet-level authorization on other modules.

## Files

```
modules/outlets/
├── outlets.module.ts               # Imports PrismaModule (global), exports OutletsService
├── outlets.controller.ts           # GET /outlets, GET /outlets/mine, PATCH /outlets/:outletId/membership
├── outlets.service.ts              # Business logic: thin delegation to repository
├── outlets.repository.ts           # All Prisma queries
├── dto/
│   ├── my-outlet.response.ts       # Response shape for /mine: id, name, address, role
│   ├── outlet-list-item.response.ts # Response shape for /outlets: id, name, address, role, membershipStatus?
│   └── update-membership.dto.ts    # { action: 'confirm' | 'reject' }
└── __tests__/
    ├── outlets.controller.spec.ts
    ├── outlets.service.spec.ts
    └── outlets.repository.spec.ts
```

## API

```
GET  /outlets                        → paginated OutletListItemResponse   (requires JWT)
GET  /outlets/mine                   → MyOutletResponse[]                 (requires JWT)
PATCH /outlets/:outletId/membership  → { status: UserOutletStatus }       (requires JWT)
```

### GET /outlets

Query params:

| Param | Type | Required | Description |
|---|---|---|---|
| `connected` | boolean | yes | `true` = CONFIRMED memberships; `false` = PENDING + REJECTED |
| `q` | string | no | Case-insensitive name search |
| `cursor` | string | no | Cursor for next page (value of last item's `id`) |

Response shape:
```json
{
  "data": [
    { "id": "clxyz123", "name": "Main Store", "address": "123 Nguyen Hue, Q1", "role": "OWNER" },
    { "id": "clabc456", "name": "Branch Store", "address": null, "role": null, "membershipStatus": "PENDING" }
  ],
  "meta": { "nextCursor": "clabc456" }
}
```

- `connected=true` items: `role` is non-null, no `membershipStatus` field
- `connected=false` items: `role` is `null`, `membershipStatus` is `"PENDING"` or `"REJECTED"`
- Page size: 20 items

### GET /outlets/mine

Returns only `CONFIRMED` memberships. PENDING and REJECTED memberships are excluded.

Response shape:
```json
{
  "data": [
    { "id": "clxyz123", "name": "Main Store", "address": "123 Nguyen Hue, Q1", "role": "OWNER" }
  ]
}
```

### PATCH /outlets/:outletId/membership

Body: `{ "action": "confirm" | "reject" }`

- `confirm`: sets `UserOutlet.status = CONFIRMED`
- `reject`: sets `UserOutlet.status = REJECTED`. Cannot reject an already-CONFIRMED membership (422 `OUTLET_MEMBERSHIP_REJECT_NOT_ALLOWED`)
- 404 `OUTLET_MEMBERSHIP_NOT_FOUND` if no membership exists

## OutletsService Methods

| Method | Signature | Used by |
|---|---|---|
| `getMyOutlets` | `(userId: string) → MyOutletResponse[]` | `OutletsController` |
| `getOutlets` | `(params: { userId, connected, q?, cursor? }) → { data, meta }` | `OutletsController` |
| `updateMembership` | `(userId, outletId, action) → { status }` | `OutletsController` |

## Data Model

Outlets use a many-to-many join through `UserOutlet`:

```
User ──── UserOutlet ──── Outlet
             role:   OutletRole    (OWNER | MANAGER | STAFF)
             status: UserOutletStatus (PENDING | CONFIRMED | REJECTED)
             @@unique([userId, outletId])
```

- `OutletRole` is a per-membership role distinct from `User.role` (platform-level: `ADMIN` | `CUSTOMER`)
- `UserOutletStatus` defaults to `PENDING` for new rows inserted by DMS
- Pre-migration rows were backfilled to `CONFIRMED`

## Error Codes

| Code | HTTP | Thrown by |
|---|---|---|
| `OUTLET_MEMBERSHIP_NOT_FOUND` | 404 | `updateMembership` — no UserOutlet row exists |
| `OUTLET_MEMBERSHIP_REJECT_NOT_ALLOWED` | 422 | `updateMembership` — cannot reject a CONFIRMED membership |

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
