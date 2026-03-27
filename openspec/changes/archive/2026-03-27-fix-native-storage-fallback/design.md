## Context

`nativeStorage` from `zmp-sdk` works only inside the Zalo app container. Outside it (browser dev, Vitest, Playwright), calling any method throws synchronously with "Unknown error. Please try again later." This propagates through `storage.ts` into `AuthProvider`'s `useEffect`, which React 18 catches and surfaces as a component crash.

We need a fallback that is transparent to all callers.

## Goals / Non-Goals

**Goals:**
- Make all `storage.*` calls safe in any environment (Zalo, browser dev, test runner)
- Zero changes to call sites — the `storage` API surface stays identical
- No behavior change in production (Zalo container)

**Non-Goals:**
- Persistent storage in tests — `localStorage` in jsdom is fine for dev/test; it resets per session
- Encryption or security hardening of token storage

## Decisions

### Use `window.APP_ID` as the Zalo environment check

`window.APP_ID` is set by the Zalo container before the mini app boots. It is `undefined` in a browser tab or test runner. The SDK itself reads this at module init (`var i = window.APP_ID`), making it the canonical signal.

Alternatives considered:

| Option | Problem |
|--------|---------|
| `getSystemInfo().platform` | `getSystemInfo()` also throws outside Zalo — same problem |
| `try nativeStorage.getItem() catch localStorage` | Works, but hides the real failure mode and adds per-call overhead |
| `import.meta.env.DEV` | Wrong signal — Zalo dev preview also has `DEV=true` |

`window.APP_ID` is evaluated once at module load (not per call), is synchronous, never throws, and correctly reflects whether the Zalo bridge is available.

### Module-level constant, not per-call check

```ts
const isZalo = typeof window !== 'undefined' && !!(window as any).APP_ID
```

Evaluated once when `storage.ts` is imported. All four storage methods branch on this constant — no runtime overhead per call.

## Risks / Trade-offs

- **`window.APP_ID` could theoretically be set by non-Zalo code** → In practice, this is a Zalo-specific global; no other library sets it. Acceptable risk.
- **Tests that set `window.APP_ID`** → Would switch to `nativeStorage`, which would throw. Tests should not set this var unless mocking the Zalo environment deliberately.

## Migration Plan

1. Update `storage.ts` with the `isZalo` check
2. Verify: `npm run start` in browser no longer crashes `AuthProvider`
3. Verify: `npm run test` passes (storage tests use `localStorage` path)
4. No rollback needed — purely additive fallback, Zalo path unchanged
