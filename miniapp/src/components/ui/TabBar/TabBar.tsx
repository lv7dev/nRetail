import { cn } from '@/utils/cn';

export interface Tab {
  key: string;
  label: string;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'default' | 'on-primary';
}

export function TabBar({ tabs, activeTab, onChange, className, variant = 'default' }: TabBarProps) {
  return (
    <div className={cn('flex gap-3 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-1 min-w-max whitespace-nowrap rounded-lg py-2 text-sm',
              variant === 'on-primary'
                ? isActive
                  ? 'bg-white text-primary'
                  : 'border border-white/50 bg-transparent text-white/80'
                : isActive
                  ? 'bg-primary text-content-inverse'
                  : 'border border-border text-content-muted',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
