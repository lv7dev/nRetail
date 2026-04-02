# Locales — i18n

Translation files for Vietnamese (`vi/`) and English (`en/`). Every namespace must exist in both languages.

## Namespaces

| Namespace | Files | Used for |
|---|---|---|
| `common` | `common.json` | Shared UI — buttons, validation messages, bottom nav labels |
| `auth` | `auth.json` | All auth pages — login, register, OTP, forgot-password, new-password |
| `errors` | `errors.json` | API error codes → user-facing messages (via `resolveApiError`) |
| `outlets` | `outlets.json` | Outlet picker page |

New domain pages (products, orders, etc.) get their own namespace — do NOT pile everything into `common`.

## Adding a new namespace

All four steps are required. Missing any one will cause keys to render as raw strings (e.g. `outlets.selectOutlet`).

1. **Create locale files** — `src/locales/vi/<name>.json` and `src/locales/en/<name>.json`
2. **Import** both files in `src/i18n.ts`
3. **Add to `ns` array** in `i18n.init()`
4. **Add to `resources`** for both `vi` and `en`

```ts
// i18n.ts — example adding 'products' namespace
import viProducts from '@/locales/vi/products.json';
import enProducts from '@/locales/en/products.json';

i18n.init({
  ns: ['common', 'auth', 'errors', 'outlets', 'products'],
  resources: {
    vi: { ..., products: viProducts },
    en: { ..., products: enProducts },
  },
});
```

## Adding keys to an existing namespace

1. Add the key to **both** `vi/<namespace>.json` and `en/<namespace>.json`
2. Use the key in the component via `useTranslation('<namespace>')`

Never add a key to only one language file — the other will fall back to `vi` (the configured `fallbackLng`) silently.

## Rules

- **Zero hardcoded strings** in pages or shared components — every visible string comes from `t()`
- **Always mock i18n in tests**: `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))` — this makes assertions language-neutral (assert on the key, not the translated string)
- **BottomNav labels** live in `common.nav.*` — do not duplicate nav labels in other namespaces

## Key structure convention

Use nested objects, not flat keys:

```json
// ✅ correct
{
  "outlets": {
    "selectOutlet": "Chọn cửa hàng",
    "noOutlets": "Bạn chưa thuộc cửa hàng nào"
  }
}

// ❌ avoid
{
  "outletsSelectOutlet": "Chọn cửa hàng"
}
```

Usage: `t('outlets.selectOutlet')` with `useTranslation('outlets')`.
