# Tasks: UI Core Pages

## Shared UI Components

- [x] `AppHeader` component — primary header bar with back button, title, optional right slot
- [x] `TabBar` component — horizontal tab strip with active state
- [x] `SectionHeader` component — left title + right "View all" link
- [x] `MenuListItem` component — icon + label + chevron row

## Navigation

- [x] Update BottomNav — 4 tabs: Home (`/`), Order (`/orders`), Outlet (`/outlet-detail`), Account (`/account`)

## Home Page

- [x] `QuickActionsGrid` — 4 icon+label action tiles
- [x] `BannerCarousel` — full-width promo banner with scroll/indicator
- [x] `PromotionSection` — section header + horizontal promotion cards
- [x] `BrandSection` — section header + horizontal brand chip scroll
- [x] Home page shell — compose all sections with i18n and locale files

## Outlet Info Page

- [x] `OutletAvatar` — store image circle + outlet name + subtitle note
- [x] `PersonCard` — name, phone, last-updated, active badge
- [x] `OutletActionButtons` — "Order control" + "Deactivate" pair
- [x] `ContactTab` — compose PersonCard sections for Owner + Contact Person
- [x] `GeneralInfoTab` stub
- [x] `SegmentationTab` stub
- [x] Outlet info page shell — AppHeader + OutletAvatar + TabBar + tab content + i18n

## Account Page

- [x] `AccountProfileHeader` — user avatar globe icon + outlet name + phone
- [x] Account page shell — profile header + MenuListItem list + logout item + i18n

## i18n

- [x] Create `home` namespace (vi + en)
- [x] Create `outlet-detail` namespace (vi + en)
- [x] Create `account` namespace (vi + en)
- [x] Register new namespaces in `i18n.ts`
