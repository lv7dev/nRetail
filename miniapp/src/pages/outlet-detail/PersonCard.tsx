import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface PersonCardProps {
  name: string;
  phone: string;
  lastUpdated: string;
  isActive?: boolean;
  className?: string;
}

export default function PersonCard({
  name,
  phone,
  lastUpdated,
  isActive,
  className,
}: PersonCardProps) {
  const { t } = useTranslation('outlet-detail');

  return (
    <div className={cn('bg-surface dark:bg-surface-dark rounded-lg p-3 space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-content-muted">{t('contact.name')}</span>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-content-muted">{t('contact.phone')}</span>
        <span className="text-sm">{phone}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-content-muted">{t('contact.lastUpdated')}</span>
        <span className="text-sm">{lastUpdated}</span>
      </div>
      {isActive !== undefined && (
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              isActive ? 'bg-success/10 text-success' : 'bg-surface-overlay text-content-muted',
            )}
          >
            {isActive ? t('contact.active') : t('contact.inactive')}
          </span>
        </div>
      )}
    </div>
  );
}
