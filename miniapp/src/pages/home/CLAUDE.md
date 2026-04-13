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

`HomePage` holds `collapsed` state + `scrollRef`. `ScrollablePage` reports `onCollapsedChange` using a hysteresis band (emit `false` at `scrollTop===0`, emit `true` at `scrollTop>=20px`, dead zone 1–19px) → sets `collapsed` state → `CollapsibleHeader` receives controlled `collapsed` prop + shared `scrollContainerRef`. This wires the scroll-driven collapse so the `OutletContextCard` collapses to a compact pill on scroll and re-expands at the top.

**Height chain:** `AppLayout.page-content` must have `flex-1` for `ScrollablePage`'s `overflow-y-auto` to have a bounded height to overflow against. Without it, the container grows to content height and no scroll events fire (collapse never triggers, pull-to-refresh never triggers).

**Refresh:** `onRefresh={refetch}` and `isRefreshing={isRefreshing}` are both wired from `useHomeRefresh`. The spinner stays visible from finger-lift through the end of the refresh cycle. `handleTouchEnd` awaits `onRefresh()` before clearing `pullDistance` to avoid a one-frame flicker between gesture release and state update.

## Component Contracts

### `OutletContextCard`

```tsx
<OutletContextCard collapsed?={false} onAction?={(key: string) => void} />
```

- `collapsed={false}` (default): shows outlet name row + 4 quick action buttons
- `collapsed={true}` (pill): outlet name + chevron visible; quick-actions grid animates to zero height
- **Animation**: Uses CSS `grid-template-rows` transition (`1fr` ↔ `0fr`, 200ms ease-in-out) with `overflow-hidden` wrapper — the quick-actions DOM stays mounted in both states (required for CSS animation, no conditional render)
- Reads `selectedOutlet.name` from `useOutletStore`; tapping outlet name navigates to `/outlets`
- 4 actions: `outletManagement`, `suggestedOrder`, `tradePrograms`, `orderHistory`
- **`collapsed` is injected automatically by `CollapsibleHeader` via `cloneElement`** — do not pass it manually when using inside `CollapsibleHeader`

### `useHomeRefresh`

```ts
const { refetch, isRefreshing } = useHomeRefresh();
```

- `refetch`: async function passed to `ScrollablePage onRefresh`; sets `isRefreshing` true while running
- `isRefreshing`: boolean passed to `ScrollablePage isRefreshing`; keeps spinner alive after finger-lift until refresh resolves
- Currently a stub (2 s timeout) — replace with real TanStack Query `refetch` + `isRefetching` when queries are added

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

| Token                         | Usage                                                           |
| ----------------------------- | --------------------------------------------------------------- |
| `bg-primary` / `text-primary` | Search bar bg, tab active bg, Add to cart button, View all text |
| `text-content-inverse`        | Text on primary bg                                              |
| `bg-surface`                  | Card backgrounds                                                |
| `bg-surface-muted`            | Image placeholders, banner placeholders                         |
| `text-content`                | Primary text                                                    |
| `text-content-muted`          | Secondary text, placeholder, inactive tabs                      |
| `border-border`               | Card borders, dividers, inactive tab borders                    |
| `bg-destructive`              | Active pagination dot                                           |
| `shadow-sm`                   | Card elevation                                                  |
| `rounded-xl`                  | Cards, images, search input                                     |
| `rounded-lg`                  | Buttons, tabs                                                   |
