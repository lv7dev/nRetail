## ADDED Requirements

### Requirement: Global ValidationPipe
A `ValidationPipe` SHALL be registered globally in `main.ts` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`. No controller SHALL need to declare its own `@UsePipes(ValidationPipe)`.

#### Scenario: Request with an unknown field
- **WHEN** a client sends a JSON body with a field not declared in the DTO
- **THEN** the API SHALL return `400 Bad Request` with a descriptive validation error

#### Scenario: Request with a missing required field
- **WHEN** a client sends a request missing a required DTO field
- **THEN** the API SHALL return `400 Bad Request` listing the failing constraint

---

### Requirement: Global ResponseInterceptor — `{ data, meta?, message? }`
A `ResponseInterceptor` SHALL be registered globally. It SHALL wrap every successful controller return value in `{ data: <value> }`. It SHALL pass `meta` and `message` through if the controller returns them as top-level keys.

#### Scenario: Controller returns a plain object
- **WHEN** a controller returns `{ id: 1, name: "foo" }`
- **THEN** the HTTP response body SHALL be `{ "data": { "id": 1, "name": "foo" } }`

#### Scenario: Controller returns a paginated result
- **WHEN** a controller returns `{ data: [...], meta: { total, page, limit } }`
- **THEN** the interceptor SHALL pass it through unchanged (already in the correct shape)

---

### Requirement: Global AllExceptionsFilter
An `AllExceptionsFilter` SHALL be registered globally. It SHALL catch all unhandled exceptions and return a consistent error shape: `{ statusCode, message, error?, timestamp, path }`. It SHALL log the full error stack in development.

#### Scenario: NestJS HttpException thrown
- **WHEN** a service throws `new NotFoundException('Product not found')`
- **THEN** the response SHALL be `{ statusCode: 404, message: "Product not found", ... }`

#### Scenario: Unexpected runtime error
- **WHEN** an unhandled `TypeError` propagates to the filter
- **THEN** the response SHALL be `{ statusCode: 500, message: "Internal server error" }` — the raw error SHALL NOT be exposed to the client

---

### Requirement: Global LoggingInterceptor
A `LoggingInterceptor` SHALL be registered globally using `nestjs-pino`. It SHALL log the HTTP method, path, response status code, and duration (ms) for every request.

#### Scenario: GET /products request completes
- **WHEN** a `GET /products` request is handled
- **THEN** a structured log line SHALL be emitted: `{ method: "GET", path: "/products", statusCode: 200, durationMs: 12 }`

---

### Requirement: Swagger at `/api/docs` (non-production only)
Swagger SHALL be configured in `main.ts` and served at `/api/docs`. It SHALL only be mounted when `NODE_ENV !== 'production'`.

#### Scenario: Developer opens /api/docs in development
- **WHEN** the app runs with `NODE_ENV=development`
- **THEN** the Swagger UI SHALL be accessible at `http://localhost:3000/api/docs`

#### Scenario: Production environment
- **WHEN** the app runs with `NODE_ENV=production`
- **THEN** `/api/docs` SHALL return 404

---

### Requirement: Stub guards and decorators
`JwtAuthGuard`, `RolesGuard`, `@CurrentUser()`, and `@Roles()` SHALL be created as placeholder files. Guards SHALL pass through (return `true`) until the auth module is implemented.

#### Scenario: Route decorated with @UseGuards(JwtAuthGuard) before auth is implemented
- **WHEN** a developer decorates a stub route with `@UseGuards(JwtAuthGuard)`
- **THEN** requests SHALL pass through (guard returns `true`) until auth is wired

---

### Requirement: EventEmitterModule registered globally
`EventEmitterModule.forRoot()` SHALL be imported in `AppModule` so any service can inject `EventEmitter2` for fire-and-forget cross-module events.

#### Scenario: Service emits a domain event
- **WHEN** a service calls `this.eventEmitter.emit('order.created', payload)`
- **THEN** any registered listener in another module SHALL receive the event without a direct import dependency
