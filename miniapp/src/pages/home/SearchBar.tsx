import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const { t } = useTranslation('home');

  return (
    <div className={cn('px-4 py-3', className)}>
      <div className="flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3">
        <Icon name="magnifying-glass" size={20} className="shrink-0 text-content-muted" />
        <span className="truncate text-base text-content-muted">{t('search.placeholder')}</span>
      </div>
    </div>
  );
}
