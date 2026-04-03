import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import ProductSection from './ProductSection';
import type { ProductCardData } from './ProductCard';

interface TabbedProductSectionProps {
  boughtProducts: ProductCardData[];
  viewedProducts: ProductCardData[];
}

type Tab = 'bought' | 'viewed';

export default function TabbedProductSection({
  boughtProducts,
  viewedProducts,
}: TabbedProductSectionProps) {
  const { t } = useTranslation('home');
  const [activeTab, setActiveTab] = useState<Tab>('bought');

  return (
    <div>
      <div className="flex gap-3 pt-3">
        <button
          onClick={() => setActiveTab('bought')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm',
            activeTab === 'bought'
              ? 'bg-primary text-content-inverse'
              : 'border border-border text-content-muted',
          )}
        >
          {t('products.boughtProducts')}
        </button>
        <button
          onClick={() => setActiveTab('viewed')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm',
            activeTab === 'viewed'
              ? 'bg-primary text-content-inverse'
              : 'border border-border text-content-muted',
          )}
        >
          {t('products.viewedProducts')}
        </button>
      </div>

      <ProductSection products={activeTab === 'bought' ? boughtProducts : viewedProducts} />
    </div>
  );
}
