# Proposal: UI Core Pages — Home, Outlet Info, Account

## Summary

Build shared UI components and implement three core pages: Home, Outlet Info (with 3 tabs), and Account. These are the first fully designed pages in the app — currently all three exist as placeholder stubs. The work also includes updating BottomNav to the 4-tab design shown in layout15.

## Scope

### In scope
- **Shared UI components** (reusable across pages): `AppHeader`, `TabBar`, `SectionHeader`, `MenuListItem`
- **BottomNav update**: 5 tabs → 4 tabs (Home, Order, Outlet, Account) per layout15
- **Home page** (layout4): quick actions grid, banner carousel, consumer promotion section, brand horizontal scroll
- **Outlet info page** (layout5): outlet avatar header, 3-tab layout (General info / Contact / Outlet segmentation), contact person cards, action buttons
- **Account page** (layout15): profile header, menu list items (View profile, Change password, Setting, Manual, Assistant, Feedback, Log out)
- **i18n**: all strings in vi/en locale files under new namespaces (`home`, `outlet-detail`, `account`)

### Out of scope
- Data fetching / API integration (pages use placeholder/mock data for now)
- Outlet General info and Segmentation tab content (rendered as stubs — only Contact tab is fully designed in layout5)
- Sub-pages linked from Account (View profile, Change password, etc.)

## Design Reference

| Layout | Page |
|--------|------|
| layout4.png | Home page |
| layout5.png | Outlet info — Contact tab |
| layout15.png | Account page + BottomNav 4-tab design |

## Color / Theming

Use existing Tailwind design tokens only — no hardcoded hex values. `bg-primary` for the app header bar, `text-content`, `text-content-muted`, `border-border` for body content. Follow existing dark mode patterns (`dark:` prefix).

## Architecture Decisions

- Shared components go in `components/ui/` (generic) — `AppHeader`, `TabBar`, `SectionHeader`, `MenuListItem`
- Page-specific sub-components are co-located inside the page folder, not exported to `ui/`
- BottomNav tabs array is updated in-place — labels and paths change, the component structure stays the same
- New i18n namespaces: `home`, `outlet-detail`, `account` — registered in `i18n.ts`
- All pages follow TDD: failing test first, then implementation

## Component Map

```
components/ui/
  AppHeader/          ← primary-colored header bar: back button + title + optional action slot
  TabBar/             ← horizontal tab strip: tabs array + activeTab + onChange
  SectionHeader/      ← "Title" left + "View all" right, optional onViewAll
  MenuListItem/       ← icon + label + chevron row (used in Account menu)

pages/home/
  index.tsx           ← Home page
  QuickActionsGrid.tsx
  BannerCarousel.tsx
  PromotionSection.tsx
  BrandSection.tsx

pages/outlet-detail/
  index.tsx           ← Outlet info page (tabs shell)
  OutletAvatar.tsx    ← store image + name + subtitle note
  ContactTab.tsx      ← Contact tab content
  PersonCard.tsx      ← single contact person block
  OutletActionButtons.tsx
  GeneralInfoTab.tsx  ← stub
  SegmentationTab.tsx ← stub

pages/account/
  index.tsx           ← Account page
  AccountProfileHeader.tsx  ← avatar + name + phone
```
