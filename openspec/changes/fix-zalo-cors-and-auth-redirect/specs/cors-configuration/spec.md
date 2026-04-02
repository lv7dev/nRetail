## ADDED Requirements

### Requirement: Explicit CORS origin allowlist
The backend SHALL restrict CORS to an explicit list of allowed origins read from the `CORS_ORIGINS` environment variable. Wildcard (`*`) CORS SHALL NOT be used.

#### Scenario: Request from allowed origin
- **WHEN** a browser sends a request with an `Origin` header matching one of the configured `CORS_ORIGINS` values
- **THEN** the response SHALL include `Access-Control-Allow-Origin: <that-origin>`

#### Scenario: Request from disallowed origin
- **WHEN** a browser sends a request with an `Origin` header not in `CORS_ORIGINS`
- **THEN** the response SHALL NOT include `Access-Control-Allow-Origin` and the browser SHALL block the response

---

### Requirement: Authorization header allowed in CORS preflight
The backend SHALL declare `Authorization` and `Content-Type` in `Access-Control-Allow-Headers` so that authenticated cross-origin requests from the Zalo WebView can pass the CORS preflight check.

#### Scenario: Preflight for authenticated request
- **WHEN** a browser sends an `OPTIONS` preflight with `Access-Control-Request-Headers: Authorization, Content-Type`
- **THEN** the response SHALL include `Access-Control-Allow-Headers: Content-Type, Authorization` and return `204` or `200`

#### Scenario: Authenticated request after successful preflight
- **WHEN** the browser sends the actual request (GET/POST/etc.) with `Authorization: Bearer <token>` after a successful preflight
- **THEN** the request SHALL reach the NestJS handler and the response SHALL include the correct CORS headers

---

### Requirement: Explicit allowed HTTP methods in CORS
The backend CORS config SHALL explicitly declare `GET, POST, PUT, PATCH, DELETE, OPTIONS` as allowed methods so preflights for all API verbs succeed.

#### Scenario: Preflight for PATCH request
- **WHEN** a browser sends an `OPTIONS` preflight with `Access-Control-Request-Method: PATCH`
- **THEN** the response SHALL include `Access-Control-Allow-Methods` containing `PATCH`
