import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}

export function AppHeader({ title, onBack, right, className }: AppHeaderProps) {
  return (
    <div className={cn('flex items-center bg-primary px-4 py-3', className)}>
      <div className="flex w-10 shrink-0 items-center">
        {onBack && (
          <button
            aria-label="back"
            onClick={onBack}
            className="flex items-center justify-center text-content-inverse"
          >
            <Icon name="arrow-left" size={20} />
          </button>
        )}
      </div>

      <h1
        className={cn(
          'flex-1 text-center text-base font-semibold text-content-inverse',
          !onBack && 'text-left',
        )}
      >
        {title}
      </h1>

      <div className="flex w-10 shrink-0 items-center justify-end">{right}</div>
    </div>
  );
}
