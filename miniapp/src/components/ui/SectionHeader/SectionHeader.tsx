import { cn } from '@/utils/cn';

export interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
  className?: string;
}

export function SectionHeader({ title, onViewAll, viewAllLabel, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-base font-semibold text-content dark:text-content-dark">{title}</span>
      {onViewAll && (
        <button onClick={onViewAll} className="text-sm text-primary">
          {viewAllLabel}
        </button>
      )}
    </div>
  );
}
