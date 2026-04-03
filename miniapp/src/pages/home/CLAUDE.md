# Home Page

## Overview

The home page (`src/pages/home/`) is composed of self-contained sub-components. Each sub-component has a co-located test file.

## File Structure

```
src/pages/home/
├── index.tsx                  ← page root, composes all sections
├── index.test.tsx
├── SearchBar.tsx              ← search input bar (shown below AppBar)
├── SearchBar.test.tsx
├── QuickActionsGrid.tsx       ← outlet info card + 4 quick action buttons
├── QuickActionsGrid.test.tsx
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

## Page Layout (top → bottom)

| Section | Component | Notes |
|---|---|---|
| Search bar | `SearchBar` | Inside primary bg strip at top |
| Outlet card | `QuickActionsGrid` | White card, -mt-4 overlap over primary bg |
| Banner carousel | `BannerCarousel` | Dot pagination, 6 dots by default |
| Consumer Promotion | `SectionHeader` + `PromotionSection` | Horizontal scroll |
| Brand | `SectionHeader` + `BrandSection` | Horizontal scroll of logo boxes |
| Trade Programs | `SectionHeader` + `ProductSection` | Vertical product list |
| Recommended Products | `SectionHeader` + `ProductSection showPagination` | Vertical + pagination dot |
| Products | `SectionHeader` + `TabbedProductSection` | Bought / Viewed tabs |

## Component Contracts

### `SearchBar`
```tsx
<SearchBar className? />
```
- Reads `search.placeholder` from `home` namespace
- Uses `Icon name="magnifying-glass"`

### `QuickActionsGrid`
```tsx
<QuickActionsGrid onAction?={(key: string) => void} />
```
- Reads `selectedOutlet.name` from `useOutletStore`
- 4 actions: `outletManagement`, `suggestedOrder`, `tradePrograms`, `orderHistory`
- Reads labels from `quickActions.*` in `home` namespace

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
