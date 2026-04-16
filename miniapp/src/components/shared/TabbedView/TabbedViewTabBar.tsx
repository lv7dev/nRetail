import { TabBar } from '@/components/ui';
import { useTabbedViewContext } from './TabbedView';

export interface TabbedViewTabBarProps {
  className?: string;
}

export function TabbedViewTabBar({ className }: TabbedViewTabBarProps) {
  const { activeTab, onTabChange, tabs } = useTabbedViewContext();

  return <TabBar tabs={tabs} activeTab={activeTab} onChange={onTabChange} className={className} />;
}
