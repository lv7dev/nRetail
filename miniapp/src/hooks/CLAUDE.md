# Hooks

Custom React hooks live in `src/hooks/`. They are the only place where TanStack Query mutations and queries are created. Pages and components call hooks — never `authService` or `apiClient` directly.

## useAuth.ts — Auth Hook Catalogue

All auth mutations and queries are in `src/hooks/useAuth.ts`.

### Mutations

| Hook | Calls | Side effects |
|------|-------|--------------|
| `useLogin()` | `POST /auth/login` | On success: `storage.setTokens()` + `setAuth(user)` |
| `useRequestOtp(flow)` | `POST /auth/otp/register` or `POST /auth/otp/forgot-password` | None |
| `useVerifyOtp()` | `POST /auth/otp/verify` | None — caller navigates with returned `otpToken` |
| `useRegister()` | `POST /auth/register` | On success: `storage.setTokens()` + `setAuth(user)` |
| `useResetPassword()` | `POST /auth/reset-password` | None — caller navigates to `/login` |
| `useLogout()` | `POST /auth/logout` | On settled (success or error): `clearAuth()` (clears tokens + user) |

### Queries

| Hook | Calls | Notes |
|------|-------|-------|
| `useMe()` | `GET /auth/me` | `enabled: false` — only used by `AuthProvider` for rehydration via `.refetch()` |

### Usage Pattern

```tsx
import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin()

  const onSubmit = (data: FormData) => {
    login(data, {
      onSuccess: () => navigate('/'),
      onError: (err) => setError(resolveApiError(err, t)),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... fields ... */}
      <Button loading={isPending} type="submit">
        {t('login.submit')}
      </Button>
    </form>
  )
}
```

## Adding a New Hook

For new domains (products, orders, etc.), create `src/hooks/useProducts.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/productService'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productService.getList,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
```

**Rules:**
- One hook file per domain
- `queryKey` arrays must be consistent across the domain — define them as constants if used in multiple hooks
- Side effects (cache invalidation, navigation, token storage) belong in `onSuccess` / `onSettled` — never in the service layer
- Never call `authService.*` or `apiClient.*` directly in a component — always go through a hook

## Testing Pages That Use Hooks

Pages that call hooks require `QueryClientProvider` in tests. Mock the **service layer** (not the hook module) so real TanStack Query lifecycle runs:

```tsx
// ✅ preferred — mock the service, keep real hook lifecycle
vi.mock('@/services/authService', () => ({
  authService: { login: vi.fn().mockResolvedValue({ accessToken: '...', ... }) },
}))

// Use only when testing the hook's own behaviour in isolation
vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
}))
```

See `src/pages/CLAUDE.md` for the full `QueryClientProvider` wrapper pattern.
