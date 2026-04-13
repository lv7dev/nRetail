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
    <div className={cn('flex items-center bg-transparent px-4', className)}>
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

      <h1 className="flex-1 text-center text-base font-semibold text-content-inverse">{title}</h1>

      <div className="flex min-w-[2.5rem] shrink-0 items-center justify-end">{right}</div>
    </div>
  );
}
