import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

export interface MenuListItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

export function MenuListItem({
  icon,
  label,
  onClick,
  variant = 'default',
  className,
}: MenuListItemProps) {
  const isDestructive = variant === 'destructive';
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3.5 border-b border-border dark:border-border-dark',
        isDestructive ? 'text-destructive' : 'text-content dark:text-content-dark',
        className,
      )}
    >
      <Icon name={icon} size={18} />
      <span className="text-sm flex-1 text-left">{label}</span>
      <Icon
        name="chevron-right"
        size={16}
        className="text-content-subtle dark:text-content-dark-subtle"
      />
    </button>
  );
}
