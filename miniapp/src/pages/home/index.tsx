import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader, SectionHeader } from '@/components/ui';
import { CollapsibleHeader, ScrollablePage } from '@/components/shared';
import waveHeader from '@/static/wave-header.svg';
import SearchBar from './SearchBar';
import OutletContextCard from './OutletContextCard';
import BannerCarousel from './BannerCarousel';
import PromotionSection from './PromotionSection';
import BrandSection from './BrandSection';
import ProductSection from './ProductSection';
import TabbedProductSection from './TabbedProductSection';
import HeaderActions from './HeaderActions';
import { useHomeRefresh } from './useHomeRefresh';

const TRADE_PROGRAM_PRODUCTS = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

const RECOMMENDED_PRODUCTS = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

const BOUGHT_PRODUCTS = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

const VIEWED_PRODUCTS = [
  { name: 'Saigon CHILL 330 Can', code: 'P00001', unit: 'Carton' },
  { name: 'Saigon LAGER 330 Can', code: 'P00003', unit: 'Carton' },
];

export default function HomePage() {
  const { t } = useTranslation(['home', 'common']);
  const { refetch, isRefreshing } = useHomeRefresh();
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        <SearchBar />
      </CollapsibleHeader>

      <ScrollablePage
        onRefresh={refetch}
        isRefreshing={isRefreshing}
        onCollapsedChange={setCollapsed}
        scrollContainerRef={scrollRef}
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
            />
            <TabbedProductSection
              boughtProducts={BOUGHT_PRODUCTS}
              viewedProducts={VIEWED_PRODUCTS}
            />
          </div>
        </div>
      </ScrollablePage>
    </div>
  );
}
