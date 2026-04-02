## 1. Miniapp — Fix handleAuthFailure redirect

- [x] 1.1 In `miniapp/src/services/axios.ts`, update `handleAuthFailure` to compute `const base = window.APP_ID ? \`/zapps/${window.APP_ID}\` : ''` and call `window.location.replace(\`${base}/login\`)`
- [x] 1.2 Run `npx prettier --write miniapp/src/services/axios.ts`
- [x] 1.3 Run `cd miniapp && npm run test` — verify all existing axios tests pass

## 2. Backend — Add CORS_ORIGINS to config schema

- [x] 2.1 In `backend/src/config/config.schema.ts`, add `CORS_ORIGINS: z.string().min(1)` to the Zod schema
- [x] 2.2 Run `npx prettier --write backend/src/config/config.schema.ts`
- [x] 2.3 Add `CORS_ORIGINS=https://h5.zdn.vn,http://localhost:3000` to `backend/.env`
- [x] 2.4 Add `CORS_ORIGINS=https://h5.zdn.vn,http://localhost:3000` to `backend/.env.example` with a comment explaining prod vs dev values

## 3. Backend — Configure explicit CORS in main.ts

- [x] 3.1 In `backend/src/main.ts`, retrieve `CORS_ORIGINS` from `configService` and split into an array: `configService.get<string>('CORS_ORIGINS').split(',').map(s => s.trim())`
- [x] 3.2 Replace `app.enableCors()` with `app.enableCors({ origin: corsOrigins, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] })`
- [x] 3.3 Run `npx prettier --write backend/src/main.ts`
- [x] 3.4 Run `cd backend && npm run test` — verify unit tests pass
- [ ] 3.5 Run `cd backend && npm run test:integration` — verify integration tests pass

## 4. Deploy

- [ ] 4.1 Set `CORS_ORIGINS=https://h5.zdn.vn` in the Render production environment variables
- [ ] 4.2 Verify the backend starts successfully in production (Zod will reject startup if `CORS_ORIGINS` is missing)
