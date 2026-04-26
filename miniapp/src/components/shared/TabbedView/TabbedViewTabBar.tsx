import { TabBar } from '@/components/ui';
import type { TabBarProps } from '@/components/ui';
import { useTabbedViewContext } from './TabbedView';

export interface TabbedViewTabBarProps {
  className?: string;
  variant?: TabBarProps['variant'];
}

export function TabbedViewTabBar({ className, variant }: TabbedViewTabBarProps) {
  const { activeTab, onTabChange, tabs } = useTabbedViewContext();

  return (
    <TabBar
      tabs={tabs}
      activeTab={activeTab}
      onChange={onTabChange}
      className={className}
      variant={variant}
    />
  );
}
