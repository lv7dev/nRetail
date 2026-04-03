import { useTranslation } from 'react-i18next';

export interface ProductCardData {
  name: string;
  code: string;
  unit: string;
  imageSrc?: string;
}

interface ProductCardProps extends ProductCardData {
  onAddToCart?: () => void;
}

export default function ProductCard({ name, code, unit, imageSrc, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation('home');

  return (
    <div className="flex gap-3 rounded-xl bg-surface p-3 shadow-sm">
      <div
        data-testid="product-image"
        className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted"
      >
        {imageSrc && <img src={imageSrc} alt={name} className="h-full w-full object-cover" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium text-content">{name}</span>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-content-muted">
            {t('products.code')}: <span className="text-content-muted">{code}</span>
          </span>
          <span className="text-xs text-content-muted">
            {t('products.unit')}: <span className="text-content-muted">{unit}</span>
          </span>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onAddToCart}
            className="rounded-lg bg-primary px-3 py-1 text-xs text-content-inverse"
          >
            {t('products.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
