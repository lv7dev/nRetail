import type { ReactNode } from 'react';
import { useTabbedViewContext } from './TabbedView';

export interface TabbedViewPanelProps {
  tabKey: string;
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
}

export function TabbedViewPanel({ tabKey, children }: TabbedViewPanelProps) {
  const { activeTab } = useTabbedViewContext();

  return <div style={tabKey === activeTab ? undefined : { display: 'none' }}>{children}</div>;
}
