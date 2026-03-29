# Config

Typed environment configuration validated at startup with Zod. The app refuses to start if any required variable is missing or invalid.

## Files

| File               | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `config.schema.ts` | Zod schema — defines all env vars, types, and defaults     |
| `configuration.ts` | Factory function — parses `process.env`, throws on failure |

## Environment Variables

| Variable         | Type                                      | Default         | Notes                                                         |
| ---------------- | ----------------------------------------- | --------------- | ------------------------------------------------------------- |
| `PORT`           | `number`                                  | `3000`          | Avoid 3000 (miniapp) and 5000 (macOS AirPlay)                 |
| `NODE_ENV`       | `'development' \| 'production' \| 'test'` | `'development'` |                                                               |
| `DATABASE_URL`   | `string` (URL)                            | —               | Docker: `postgresql://nretail:nretail@localhost:5434/nretail` |
| `REDIS_URL`      | `string` (URL)                            | —               | Docker: `redis://localhost:6379`                              |
| `JWT_SECRET`     | `string` (min 16 chars)                   | —               |                                                               |
| `JWT_EXPIRES_IN` | `string`                                  | `'7d'`          | e.g. `7d`, `24h`, `3600`                                      |

## How to Use ConfigService

```ts
import { ConfigService } from '@nestjs/config';
import type { Config } from './config.schema';

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService<Config, true>) {}

  doSomething() {
    const secret = this.config.get('JWT_SECRET', { infer: true }); // → string (typed)
    const port = this.config.get('PORT', { infer: true }); // → number (typed)
  }
}
```

Pass `{ infer: true }` to get type-safe return values from the Zod-inferred `Config` type. Without it, `get()` returns `unknown`.

## Adding a New Variable

1. Add to `config.schema.ts`:
   ```ts
   SMS_API_KEY: z.string().min(1),
   ```
2. Add to `.env` and `.env.example`
3. `ConfigService` immediately provides it with the correct type

**Never** read from `process.env` directly in application code — always go through `ConfigService`.
