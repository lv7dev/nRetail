import { TabbedView as TabbedViewRoot } from './TabbedView';
import { TabbedViewPanel } from './TabbedViewPanel';
import { TabbedViewPanels } from './TabbedViewPanels';
import { TabbedViewTabBar } from './TabbedViewTabBar';

export const TabbedView = Object.assign(TabbedViewRoot, {
  TabBar: TabbedViewTabBar,
  Panels: TabbedViewPanels,
  Panel: TabbedViewPanel,
});
