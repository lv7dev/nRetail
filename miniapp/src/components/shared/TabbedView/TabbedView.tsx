import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Tab } from '@/components/ui';

interface TabbedViewContextValue {
  activeTab: string;
  onTabChange: (key: string) => void;
  tabs: Tab[];
}

const TabbedViewContext = createContext<TabbedViewContextValue | null>(null);

export interface TabbedViewProps {
  children: ReactNode;
  tabs?: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export function TabbedView({
  children,
  tabs = [],
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabbedViewProps) {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(
    /* v8 ignore next */
    defaultTab ?? tabs[0]?.key ?? '',
  );

  useEffect(() => {
    /* v8 ignore next 3 */
    if (!controlledActiveTab && !uncontrolledActiveTab && tabs[0]?.key) {
      setUncontrolledActiveTab(tabs[0].key);
    }
  }, [controlledActiveTab, tabs, uncontrolledActiveTab]);

  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;

  const value = useMemo<TabbedViewContextValue>(
    () => ({
      activeTab,
      onTabChange: (key: string) => {
        if (controlledActiveTab === undefined) {
          setUncontrolledActiveTab(key);
        }
        onTabChange?.(key);
      },
      tabs,
    }),
    [activeTab, controlledActiveTab, onTabChange, tabs],
  );

  return <TabbedViewContext.Provider value={value}>{children}</TabbedViewContext.Provider>;
}

export function useTabbedViewContext() {
  const context = useContext(TabbedViewContext);

  /* v8 ignore next 3 */
  if (!context) {
    throw new Error('TabbedView components must be used within TabbedView');
  }

  return context;
}
