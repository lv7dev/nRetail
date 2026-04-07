# Home Page

## Overview

The home page (`src/pages/home/`) is composed of self-contained sub-components. Each sub-component has a co-located test file.

## File Structure

```
src/pages/home/
├── index.tsx                  ← page root, composes CollapsibleHeader + ScrollablePage + sections
├── index.test.tsx
├── SearchBar.tsx              ← search input bar (rendered inside CollapsibleHeader children slot)
├── SearchBar.test.tsx
├── OutletContextCard.tsx      ← outlet name + 4 quick actions; accepts collapsed prop (pill mode)
├── OutletContextCard.test.tsx
├── QuickActionsGrid.tsx       ← thin wrapper — delegates to OutletContextCard (kept for compat)
├── QuickActionsGrid.test.tsx
├── useHomeRefresh.ts          ← returns refetch() for pull-to-refresh; stub until real queries added
├── useHomeRefresh.test.ts
├── BannerCarousel.tsx         ← image banner with dot pagination
├── BannerCarousel.test.tsx
├── PromotionSection.tsx       ← horizontal scroll of promotion banner cards
├── PromotionSection.test.tsx
├── BrandSection.tsx           ← horizontal scroll of brand logo boxes
├── BrandSection.test.tsx
├── ProductCard.tsx            ← single product row: image + name/code/unit + Add to cart
├── ProductCard.test.tsx
├── ProductSection.tsx         ← vertical list of ProductCards + optional pagination
├── ProductSection.test.tsx
├── TabbedProductSection.tsx   ← two-tab switcher (Bought / Viewed) + ProductSection
└── TabbedProductSection.test.tsx
```

## Page Layout

```
AppLayout (page-content: flex column)
  └── HomePage (flex:1 flex-col)
        ├── CollapsibleHeader        ← static zone, not scrollable
        │    ├── topBar: AppHeader   ← always visible
        │    ├── children: SearchBar ← inside primary bg
        │    └── card: OutletContextCard  ← collapses to pill on scroll
        │
        └── ScrollablePage          ← flex:1, overflow-y:auto — owns the scroll
             ├── BannerCarousel
             ├── PromotionSection
             ├── BrandSection
             ├── ProductSection (Trade Programs)
             ├── ProductSection (Recommended, showPagination)
             └── TabbedProductSection
```

`ScrollablePage` reports `onCollapsedChange(scrollTop > 0)` → HomePage `collapsed` state → `CollapsibleHeader` controlled prop.

## Component Contracts

### `OutletContextCard`
```tsx
<OutletContextCard collapsed?={false} onAction?={(key: string) => void} />
```
- `collapsed={false}` (default): shows outlet name row + 4 quick action buttons
- `collapsed={true}` (pill): shows outlet name + chevron only; action grid hidden
- Reads `selectedOutlet.name` from `useOutletStore`; tapping outlet name navigates to `/outlets`
- 4 actions: `outletManagement`, `suggestedOrder`, `tradePrograms`, `orderHistory`
- **`collapsed` is injected automatically by `CollapsibleHeader` via `cloneElement`** — do not pass it manually when using inside `CollapsibleHeader`

### `useHomeRefresh`
```ts
const { refetch } = useHomeRefresh();
```
- Returns `refetch()` async function wired to `ScrollablePage onRefresh`
- Currently a stub — wire real TanStack Query `refetch` calls here as API integrations are added

### `SearchBar`
```tsx
<SearchBar className? />
```
- Reads `search.placeholder` from `home` namespace
- Uses `Icon name="magnifying-glass"`

### `BannerCarousel`
```tsx
<BannerCarousel alt={string} className? totalSlides?={6} activeSlide?={1} />
```
- `activeSlide` dot highlighted with `bg-destructive`; others `bg-surface opacity-60`

### `PromotionSection`
- Renders `PROMOTION_COUNT` (3) placeholder cards — replace with API data when available

### `BrandSection`
- Renders `BRANDS` array (`CHILL`, `SPECIAL`, `LAGER`) — replace with API data when available

### `ProductCard`
```tsx
<ProductCard name code unit imageSrc? onAddToCart?={() => void} />
```
- Image placeholder shown when `imageSrc` is absent
- Add to cart button calls `onAddToCart` if provided

### `ProductSection`
```tsx
<ProductSection products={ProductCardData[]} showPagination?={false} />
```
- `showPagination` shows a small scroll indicator below the list

### `TabbedProductSection`
```tsx
<TabbedProductSection boughtProducts={ProductCardData[]} viewedProducts={ProductCardData[]} />
```
- Internal state controls active tab; no external state needed
- Active tab: `bg-primary text-content-inverse`; inactive: `border border-border text-content-muted`

## i18n Keys (`home` namespace)

```
search.placeholder
quickActions.outletManagement | suggestedOrder | tradePrograms | orderHistory
sections.consumerPromotion | brand | tradePrograms | recommendedProducts | products | viewAll
products.code | unit | addToCart | boughtProducts | viewedProducts
banner.defaultAlt
```

## Design Tokens Used

All tokens come from `tailwind.config.js` — no hardcoded hex values.

| Token | Usage |
|---|---|
| `bg-primary` / `text-primary` | Search bar bg, tab active bg, Add to cart button, View all text |
| `text-content-inverse` | Text on primary bg |
| `bg-surface` | Card backgrounds |
| `bg-surface-muted` | Image placeholders, banner placeholders |
| `text-content` | Primary text |
| `text-content-muted` | Secondary text, placeholder, inactive tabs |
| `border-border` | Card borders, dividers, inactive tab borders |
| `bg-destructive` | Active pagination dot |
| `shadow-sm` | Card elevation |
| `rounded-xl` | Cards, images, search input |
| `rounded-lg` | Buttons, tabs |
