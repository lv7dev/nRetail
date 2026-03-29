# Types

Shared TypeScript interfaces and type aliases. No logic, no imports from other `@/` modules — these are pure type declarations consumed across the app.

## Files

| File      | Exports                                                  | Used by                                        |
| --------- | -------------------------------------------------------- | ---------------------------------------------- |
| `auth.ts` | `User`, `TokenPair`, `AuthResponse`, `OtpVerifyResponse` | `useAuthStore`, `useAuth` hooks, `authService` |
| `cart.ts` | `CartItem`                                               | `useCartStore`, cart-related pages             |

---

## auth.ts

```ts
interface User {
  id: string;
  phone: string;
  name: string;
  role: string; // 'admin' | 'staff' | 'customer' — kept as string for forward compat
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse extends TokenPair {
  user: User; // returned by login, register, token refresh
}

interface OtpVerifyResponse {
  otpToken: string; // short-lived token used as proof of OTP for register/reset-password
}
```

**`otpToken` flow:** `POST /auth/otp/verify` returns `{ otpToken }`. The frontend passes it in router state to `/register/complete` or `/new-password`, then includes it in the `POST /auth/register` or `POST /auth/reset-password` body. It expires quickly (backend-controlled) and is single-use.

---

## cart.ts

```ts
interface CartItem {
  id: string;
  name: string;
  price: number; // in smallest currency unit (e.g. VND, no decimals)
  quantity: number;
}
```

**Price rule:** All money values are integers (smallest unit). Display with `dinero.js` or locale-aware formatting — never raw division.

---

## Adding New Types

Add domain-specific interfaces in new files (`product.ts`, `order.ts`, etc.). Import with `import type` at the usage site:

```ts
import type { Product } from '@/types/product';
```

**Rules:**

- No runtime code in `src/types/` — only `interface`, `type`, and `enum` declarations
- Do not re-export from a barrel `index.ts` — import directly from the specific file
- `src/types/**` is excluded from coverage measurement (no executable code)
