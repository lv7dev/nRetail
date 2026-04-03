import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/ui';
import SearchBar from './SearchBar';
import QuickActionsGrid from './QuickActionsGrid';
import BannerCarousel from './BannerCarousel';
import PromotionSection from './PromotionSection';
import BrandSection from './BrandSection';
import ProductSection from './ProductSection';
import TabbedProductSection from './TabbedProductSection';

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
  const { t } = useTranslation('home');

  return (
    <div>
      <div className="bg-primary" style={{ paddingTop: 'var(--zalo-chrome-top)' }}>
        <SearchBar />
      </div>

      <div className="space-y-4 px-4 py-6">
        <QuickActionsGrid />

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
          <TabbedProductSection boughtProducts={BOUGHT_PRODUCTS} viewedProducts={VIEWED_PRODUCTS} />
        </div>
      </div>
    </div>
  );
}
