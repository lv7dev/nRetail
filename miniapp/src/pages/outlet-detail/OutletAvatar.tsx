import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui';

interface OutletAvatarProps {
  name: string;
  subtitle?: string;
  className?: string;
}

export default function OutletAvatar({ name, subtitle, className }: OutletAvatarProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="rounded-full bg-primary/10 p-4">
        <Icon name="globe" size={60} />
      </div>
      <p className="font-bold text-lg text-center">{name}</p>
      {subtitle && <p className="text-sm text-content-muted text-center">{subtitle}</p>}
    </div>
  );
}
