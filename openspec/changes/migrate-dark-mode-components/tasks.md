## 1. UI Components

- [ ] 1.1 Migrate `components/ui/Button/Button.tsx` — add `dark:bg-surface-dark-muted dark:text-content-dark dark:border-border-dark` to secondary variant; add `dark:text-content-dark dark:hover:bg-surface-dark-muted` to ghost variant
- [ ] 1.2 Migrate `components/ui/Input/Input.tsx` — add `dark:bg-surface-dark dark:text-content-dark dark:border-border-dark dark:placeholder:text-content-dark-subtle` to input element; add `dark:text-content-dark` to label
- [ ] 1.3 Migrate `components/ui/PasswordInput/PasswordInput.tsx` — add dark variants to input element, label, and eye-toggle icon button (matching Input pattern plus `dark:text-content-dark-muted` for icon)
- [ ] 1.4 Migrate `components/ui/OtpInput/OtpInput.tsx` — add `dark:bg-surface-dark dark:border-border-dark dark:text-content-dark` to each digit input cell
- [ ] 1.5 Migrate `components/ui/Checkbox/Checkbox.tsx` — add `dark:border-border-dark` to checkbox input; add `dark:text-content-dark` to label

## 2. Shared Components and Layouts

- [ ] 2.1 Migrate `components/shared/BottomNav.tsx` — add `dark:bg-surface-dark dark:border-border-dark` to the nav container
- [ ] 2.2 Migrate `components/shared/LanguageSwitcher/LanguageSwitcher.tsx` — add dark variants to trigger button (`dark:text-content-dark-muted dark:hover:text-content-dark dark:hover:bg-surface-dark-muted`), dropdown panel (`dark:bg-surface-dark dark:border-border-dark`), and option items (`dark:text-content-dark dark:hover:bg-surface-dark-muted`)
- [ ] 2.3 Migrate `components/AuthLayout.tsx` — add `dark:bg-surface-dark` to the root container div

## 3. Auth Pages

- [ ] 3.1 Migrate `pages/auth/login/index.tsx` — add `dark:text-content-dark` to `<h1>`, `dark:text-content-dark-muted` to muted paragraphs
- [ ] 3.2 Migrate `pages/auth/register/index.tsx` — add `dark:text-content-dark` to `<h1>`, `dark:text-content-dark-muted` to muted text
- [ ] 3.3 Migrate `pages/auth/register/complete.tsx` — add `dark:text-content-dark` to `<h1>`
- [ ] 3.4 Migrate `pages/auth/otp/index.tsx` — add `dark:text-content-dark` to `<h1>` and inline `<span>`; add `dark:text-content-dark-muted` to muted paragraphs
- [ ] 3.5 Migrate `pages/auth/forgot-password/index.tsx` — add `dark:text-content-dark` to `<h1>`, `dark:text-content-dark-muted` to description paragraph
- [ ] 3.6 Migrate `pages/auth/new-password/index.tsx` — add `dark:text-content-dark` to `<h1>`

## 4. CSS Files

- [ ] 4.1 Migrate `src/css/app.css` — add `[html.dark] .section-container { background: <dark-surface-value>; }` rule below the existing `.section-container` block to override the hardcoded `#ffffff`

## 5. Verification

- [ ] 5.1 Run `cd miniapp && npm run test` — confirm zero regressions in unit/component tests
- [ ] 5.2 Run grep audit: `grep -rn "bg-surface\|text-content\|border-border" miniapp/src/components miniapp/src/pages --include="*.tsx"` — confirm every match has a corresponding `dark:` variant
- [ ] 5.3 Manual visual check — toggle dark mode in the running app and verify all migrated components switch correctly
