# Shared Infrastructure

Cross-cutting NestJS building blocks registered globally in `AppModule`. These run on every request without per-module configuration.

## Directory Layout

```
shared/
├── database/
│   ├── prisma.service.ts       # PrismaClient wrapper (injected as singleton)
│   └── prisma.module.ts        # Global module — exports PrismaService everywhere
├── decorators/
│   ├── current-user.decorator.ts  # @CurrentUser() — extracts req.user from JWT context
│   └── roles.decorator.ts         # @Roles(...) — attaches required roles metadata
├── filters/
│   └── http-exception.filter.ts   # AllExceptionsFilter — uniform error response shape
├── guards/
│   ├── jwt-auth.guard.ts           # JwtAuthGuard — verifies Bearer token via passport-jwt
│   └── roles.guard.ts              # RolesGuard — checks @Roles() metadata against user role
├── interceptors/
│   ├── response.interceptor.ts     # ResponseInterceptor — wraps all responses in { data }
│   └── logging.interceptor.ts      # LoggingInterceptor — request/response logging
└── pipes/
    ├── validation.pipe.ts          # globalValidationPipe — class-validator + custom errors
    └── extract-constraint-params.ts # Parses constraint params (e.g. { min: 6 } from minLength)
```

---

## ResponseInterceptor

Wraps every successful controller response in `{ data: T }`:

```ts
// Controller returns:
return user;                    // { id: '1', phone: '...' }

// Client receives:
{ "data": { "id": "1", "phone": "..." } }
```

Registered globally via `APP_INTERCEPTOR` in `AppModule`. No per-controller work needed.

> **Frontend note:** `axios.ts` typed helpers (`get<T>`, `post<T>`) automatically unwrap `data` — callers receive `T` directly. The raw `{ data: T }` is only visible when using `apiClient` directly.

---

## AllExceptionsFilter

Catches all exceptions and formats them into a consistent error shape. Registered via `APP_FILTER` in `AppModule`.

**Error shapes:**

```json
// 400 Validation error (from ValidationPipe)
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "phone", "constraint": "matches", "message": "phone must match /^0\\d{9}$/ regular expression" }
  ]
}

// 4xx Business error (thrown by services)
{
  "statusCode": 409,
  "message": "Phone number already registered",
  "code": "PHONE_ALREADY_EXISTS"
}

// 429 Rate limit
{
  "statusCode": 429,
  "message": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}

// 500 Unexpected error (stack trace logged, not exposed)
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Rule:** Every 4xx error thrown by a service must include a `code` field — the frontend uses it for i18n translation via `errors.json`.

---

## ValidationPipe (`globalValidationPipe`)

Custom `ValidationPipe` registered globally. Features:

- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with extra fields
- `transform: true` — coerces query param strings to numbers/booleans
- Custom `exceptionFactory` — converts `class-validator` errors into structured `{ field, constraint, params, message }` items

**Using it in DTOs:**

```ts
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'phone must be a valid Vietnamese phone number' })
  phone: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## JwtAuthGuard

Wraps `@nestjs/passport`'s `AuthGuard('jwt')`. Validates the `Authorization: Bearer <token>` header using `JwtStrategy`. Sets `req.user` to the JWT payload `{ sub, phone, role }` on success.

```ts
// Protect a single route
@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@CurrentUser() user: User) { ... }

// Protect an entire controller
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController { ... }
```

Always pair with `@ApiBearerAuth()` so Swagger UI includes the token in requests.

---

## RolesGuard + @Roles()

`RolesGuard` reads the `@Roles('admin', 'staff')` metadata set by the `@Roles()` decorator and compares it against `req.user.role`. Always pair with `JwtAuthGuard` — `RolesGuard` assumes `req.user` is already set.

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deleteProduct(@Param('id') id: string) { ... }
```

Available roles: `admin`, `staff`, `customer`.

---

## @CurrentUser()

Parameter decorator that extracts `req.user` (populated by `JwtAuthGuard`):

```ts
@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@CurrentUser() user: User): UserResponse {
  return user;
}
```

---

## PrismaService

Singleton `PrismaClient` instance. Injected into every repository via `PrismaModule` (registered as a global module).

```ts
// In any module's repository
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany();
  }
}
```

`PrismaModule` is `@Global()` — do not add it to module `imports` arrays. It is available everywhere automatically.

> **Prisma v7 note:** `PrismaService` injects `ConfigService` and passes `new PrismaPg({ connectionString })` as the adapter. An empty `new PrismaClient()` without an adapter throws in Prisma v7.
