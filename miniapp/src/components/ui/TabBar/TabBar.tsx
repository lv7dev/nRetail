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
}

export function TabBar({ tabs, activeTab, onChange, className }: TabBarProps) {
  return (
    <div
      role="tablist"
      className={cn('flex border-b border-border dark:border-border-dark', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (!isActive) onChange(tab.key);
            }}
            className={cn(
              'py-2 px-4 text-sm -mb-px',
              isActive
                ? 'text-primary font-semibold border-b-2 border-primary'
                : 'text-content-muted dark:text-content-dark-muted',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
