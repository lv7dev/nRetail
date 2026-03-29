# Users Module

Manages user identity and profile. Other modules (primarily `auth`) consume `UsersService` — they never import `UsersRepository` directly.

## Responsibility

- Store and retrieve user records
- Support auth operations: create user on register, look up by phone on login, update password on reset

**Not responsible for:** JWT issuance, OTP handling, session management — those belong in `AuthModule`.

## Files

```
modules/users/
├── users.module.ts         # Imports PrismaModule, exports UsersService
├── users.controller.ts     # GET /users/me — returns current user profile
├── users.service.ts        # Business logic: thin delegation to repository
├── users.repository.ts     # All Prisma queries
└── __tests__/
    ├── users.controller.spec.ts
    ├── users.service.spec.ts
    └── users.repository.spec.ts
```

## API

```
GET /users/me    → UserResponse   (requires JWT)
```

## UsersService Methods

| Method           | Signature                                   | Used by                                       |
| ---------------- | ------------------------------------------- | --------------------------------------------- |
| `findByPhone`    | `(phone: string) → User \| null`            | `AuthService.login`, `AuthService.requestOtp` |
| `findById`       | `(id: string) → User \| null`               | `JwtStrategy.validate`, `AuthService.getMe`   |
| `create`         | `(data: { phone, name, password? }) → User` | `AuthService.register`                        |
| `updatePassword` | `(userId, hashedPassword) → User`           | `AuthService.resetPassword`                   |

## Cross-Module Usage

`AuthModule` imports `UsersModule` to access `UsersService`:

```ts
// auth.module.ts
@Module({
  imports: [UsersModule, ...],
})
export class AuthModule {}

// auth.service.ts
constructor(private readonly usersService: UsersService) {}

const user = await this.usersService.findByPhone(phone);
```

**Rule:** Only import `UsersService` — never `UsersRepository`. Repositories are private to their module.

## Adding User Profile Fields

1. Add the column to the Prisma schema and generate a migration
2. Add the field to `users.repository.ts` queries
3. Update `UserResponse` DTO and `@ApiProperty()` decorators
4. Tests: update `UsersRepository` mock in `AuthService` tests, add `UsersRepository` unit test for the new query
