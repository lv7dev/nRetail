import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader, SearchInput, SectionHeader } from '@/components/ui';
import { CollapsibleHeader, ScrollablePage, TabbedView } from '@/components/shared';
import waveHeader from '@/static/wave-header.svg';
import OutletContextCard from './OutletContextCard';
import BannerCarousel from './BannerCarousel';
import PromotionSection from './PromotionSection';
import BrandSection from './BrandSection';
import ProductSection from './ProductSection';
import HeaderActions from './HeaderActions';
import { useHomeRefresh } from './useHomeRefresh';
import type { ProductCardData } from './ProductCard';

const TRADE_PROGRAM_PRODUCTS: ProductCardData[] = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

const RECOMMENDED_PRODUCTS: ProductCardData[] = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

const INITIAL_BOUGHT: ProductCardData[] = [
  { name: 'Saigon CHILL 330ml Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330ml Can', code: 'P00003', unit: 'Carton' },
  { name: 'Saigon SPECIAL 330ml Can', code: 'P00005', unit: 'Carton' },
  { name: 'Saigon CHILL 500ml Can', code: 'P00007', unit: 'Carton' },
  { name: 'Saigon LAGER 330ml Bottle', code: 'P00009', unit: 'Case' },
  { name: 'Saigon SPECIAL 330ml Bottle', code: 'P00011', unit: 'Case' },
  { name: 'Saigon CHILL 355ml Can', code: 'P00013', unit: 'Carton' },
  { name: 'Saigon LAGER 500ml Can', code: 'P00015', unit: 'Carton' },
];

const MORE_BOUGHT: ProductCardData[] = [
  { name: 'Saigon SPECIAL 500ml Can', code: 'P00017', unit: 'Carton' },
  { name: 'Saigon CHILL 1L Bottle', code: 'P00019', unit: 'Case' },
  { name: 'Saigon LAGER 1L Bottle', code: 'P00021', unit: 'Case' },
  { name: 'Saigon SPECIAL 1L Bottle', code: 'P00023', unit: 'Case' },
];

const INITIAL_VIEWED: ProductCardData[] = [
  { name: 'Bia Viet 330ml Can', code: 'P00002', unit: 'Carton' },
  { name: 'Bia Viet 500ml Can', code: 'P00004', unit: 'Carton' },
  { name: 'Tiger Crystal 330ml Can', code: 'P00006', unit: 'Carton' },
  { name: 'Tiger Silver 330ml Can', code: 'P00008', unit: 'Carton' },
  { name: 'Heineken 330ml Can', code: 'P00010', unit: 'Carton' },
  { name: 'Heineken Silver 330ml Can', code: 'P00012', unit: 'Carton' },
  { name: 'Tiger Original 330ml Bottle', code: 'P00014', unit: 'Case' },
  { name: 'Bia Viet 330ml Bottle', code: 'P00016', unit: 'Case' },
];

const MORE_VIEWED: ProductCardData[] = [
  { name: 'Heineken 500ml Can', code: 'P00018', unit: 'Carton' },
  { name: 'Tiger Crystal 500ml Can', code: 'P00020', unit: 'Carton' },
  { name: 'Tiger Silver 500ml Bottle', code: 'P00022', unit: 'Case' },
  { name: 'Bia Viet 1L Bottle', code: 'P00024', unit: 'Case' },
];

type ProductTab = 'bought' | 'viewed';

export default function HomePage() {
  const { t } = useTranslation(['home', 'common']);
  const { refetch, isRefreshing } = useHomeRefresh();
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Controlled active tab — needed so outer ScrollablePage's onLoadMore targets the right tab
  const [activeProductTab, setActiveProductTab] = useState<ProductTab>('bought');

  // Per-tab paginated state
  const [boughtProducts, setBoughtProducts] = useState(INITIAL_BOUGHT);
  const [viewedProducts, setViewedProducts] = useState(INITIAL_VIEWED);
  const [boughtHasMore, setBoughtHasMore] = useState(true);
  const [viewedHasMore, setViewedHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // Simulate network delay
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    if (activeProductTab === 'bought') {
      setBoughtProducts((prev) => [...prev, ...MORE_BOUGHT]);
      setBoughtHasMore(false);
    } else {
      setViewedProducts((prev) => [...prev, ...MORE_VIEWED]);
      setViewedHasMore(false);
    }
    setIsLoadingMore(false);
  };

  const productTabs = [
    { key: 'bought', label: t('products.boughtProducts') },
    { key: 'viewed', label: t('products.viewedProducts') },
  ];

  const hasMore = activeProductTab === 'bought' ? boughtHasMore : viewedHasMore;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CollapsibleHeader
        className="pb-4"
        topBar={<AppHeader title={t('common:nav.home')} right={<HeaderActions />} />}
        decoration={
          <img
            src={waveHeader}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-bottom"
          />
        }
        card={<OutletContextCard />}
        collapsed={collapsed}
        scrollContainerRef={scrollRef}
      >
        <div className="px-4 pb-3">
          <SearchInput readOnly placeholder={t('search.placeholder')} />
        </div>
      </CollapsibleHeader>

      <ScrollablePage
        onRefresh={refetch}
        isRefreshing={isRefreshing}
        onCollapsedChange={setCollapsed}
        scrollContainerRef={scrollRef}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      >
        <div className="space-y-4 px-4 pb-4">
          <BannerCarousel alt={t('banner.defaultAlt')} className="rounded-xl" />

          <div>
            <SectionHeader
              title={t('sections.consumerPromotion')}
              onViewAll={() => {}}
              viewAllLabel={t('sections.viewAll')}
            />
            <PromotionSection />
          </div>

          <div>
            <SectionHeader
              title={t('sections.brand')}
              onViewAll={() => {}}
              viewAllLabel={t('sections.viewAll')}
            />
            <BrandSection />
          </div>

          <div>
            <SectionHeader
              title={t('sections.tradePrograms')}
              onViewAll={() => {}}
              viewAllLabel={t('sections.viewAll')}
            />
            <ProductSection products={TRADE_PROGRAM_PRODUCTS} />
          </div>

          <div>
            <SectionHeader
              title={t('sections.recommendedProducts')}
              onViewAll={() => {}}
              viewAllLabel={t('sections.viewAll')}
            />
            <ProductSection products={RECOMMENDED_PRODUCTS} showPagination />
          </div>

          <div>
            <SectionHeader
              title={t('sections.products')}
              onViewAll={() => {}}
              viewAllLabel={t('sections.viewAll')}
              className="pb-3"
            />
            <TabbedView
              tabs={productTabs}
              activeTab={activeProductTab}
              onTabChange={(key) => setActiveProductTab(key as ProductTab)}
            >
              <TabbedView.TabBar className="sticky top-[-1px] z-10 " />
              <TabbedView.Panels mode="outer" outerScrollRef={scrollRef}>
                <TabbedView.Panel tabKey="bought">
                  <ProductSection products={boughtProducts} />
                </TabbedView.Panel>
                <TabbedView.Panel tabKey="viewed">
                  <ProductSection products={viewedProducts} />
                </TabbedView.Panel>
              </TabbedView.Panels>
            </TabbedView>
          </div>
        </div>
      </ScrollablePage>
    </div>
  );
}
