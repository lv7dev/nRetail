import type { ReactNode } from 'react';
import { useTabbedViewContext } from './TabbedView';

export interface TabbedViewPanelProps {
  tabKey: string;
  children: ReactNode;
  className?: string;
  onRefresh?: () => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
}

export function TabbedViewPanel({ tabKey, children, className }: TabbedViewPanelProps) {
  const { activeTab } = useTabbedViewContext();

  return (
    <div className={className} style={tabKey === activeTab ? undefined : { display: 'none' }}>
      {children}
    </div>
  );
}
