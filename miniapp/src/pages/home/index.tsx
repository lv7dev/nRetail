import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/ui';
import QuickActionsGrid from './QuickActionsGrid';
import BannerCarousel from './BannerCarousel';
import PromotionSection from './PromotionSection';
import BrandSection from './BrandSection';

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div>
      <div className="bg-primary px-4 pt-4 pb-6">
        <QuickActionsGrid />
      </div>

      <BannerCarousel alt={t('banner.defaultAlt')} className="rounded-none" />

      <div className="px-4 pt-4 space-y-4">
        <div>
          <SectionHeader
            title={t('sections.consumerPromotion')}
            viewAllLabel={t('sections.viewAll')}
          />
          <PromotionSection />
        </div>

        <div>
          <SectionHeader title={t('sections.brand')} viewAllLabel={t('sections.viewAll')} />
          <BrandSection />
        </div>
      </div>
    </div>
  );
}
