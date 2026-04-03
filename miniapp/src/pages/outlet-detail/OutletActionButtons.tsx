import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface OutletActionButtonsProps {
  onOrderControl?: () => void;
  onDeactivate?: () => void;
  className?: string;
}

export default function OutletActionButtons({
  onOrderControl,
  onDeactivate,
  className,
}: OutletActionButtonsProps) {
  const { t } = useTranslation('outlet-detail');

  return (
    <div className={cn('flex gap-3 px-4', className)}>
      <button
        onClick={onOrderControl}
        className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-content dark:border-border-dark dark:text-content-dark"
      >
        {t('actions.orderControl')}
      </button>
      <button
        onClick={onDeactivate}
        className="flex-1 rounded-lg border border-destructive py-2 text-sm font-medium text-destructive"
      >
        {t('actions.deactivate')}
      </button>
    </div>
  );
}
