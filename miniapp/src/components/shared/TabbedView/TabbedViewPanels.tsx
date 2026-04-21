import {
  Children,
  cloneElement,
  useEffect,
  isValidElement,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { ScrollablePage } from '../ScrollablePage';
import { useTabbedViewContext } from './TabbedView';
import type { TabbedViewPanelProps } from './TabbedViewPanel';

export interface TabbedViewPanelsProps {
  children: ReactNode;
  mode: 'self' | 'outer';
  outerScrollRef?: MutableRefObject<HTMLDivElement | null>;
}

export function TabbedViewPanels({ children, mode, outerScrollRef }: TabbedViewPanelsProps) {
  const { activeTab } = useTabbedViewContext();
  const panelsRef = useRef<HTMLDivElement>(null);
  const previousActiveTabRef = useRef<string>();
  const lastKnownScrollTopRef = useRef(0);
  const scrollPositionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (mode !== 'outer') {
      return;
    }

    const outerScrollElement = outerScrollRef?.current;
    if (!outerScrollElement) {
      return;
    }

    const handleScroll = () => {
      lastKnownScrollTopRef.current = outerScrollElement.scrollTop;
    };

    outerScrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      outerScrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [mode, outerScrollRef]);

  useLayoutEffect(() => {
    if (mode !== 'outer' || !activeTab) {
      previousActiveTabRef.current = activeTab;
      return;
    }

    if (!previousActiveTabRef.current) {
      previousActiveTabRef.current = activeTab;
      return;
    }

    const outerScrollElement = outerScrollRef?.current;
    if (!outerScrollElement) {
      previousActiveTabRef.current = activeTab;
      return;
    }

    scrollPositionsRef.current.set(previousActiveTabRef.current, lastKnownScrollTopRef.current);

    /* v8 ignore next 4 */
    if (!panelsRef.current) {
      previousActiveTabRef.current = activeTab;
      return;
    }

    const savedScrollTop = scrollPositionsRef.current.get(activeTab);
    if (savedScrollTop !== undefined) {
      outerScrollElement.scrollTop = savedScrollTop;
    } else {
      // First visit: scroll so panels top sits just below any sticky sibling (e.g. TabBar).
      // Only subtract height when the preceding sibling is position:sticky — this is safe
      // for Mode 3 where TabBar is in the header and is not a sibling of Panels.
      const prevEl = panelsRef.current.previousElementSibling as HTMLElement | null;
      /* v8 ignore next 4 */
      const stickyOffset =
        prevEl && getComputedStyle(prevEl).position === 'sticky'
          ? prevEl.getBoundingClientRect().height
          : 0;

      outerScrollElement.scrollTop =
        outerScrollElement.scrollTop +
        panelsRef.current.getBoundingClientRect().top -
        outerScrollElement.getBoundingClientRect().top -
        stickyOffset;
    }

    previousActiveTabRef.current = activeTab;
  }, [activeTab, mode, outerScrollRef]);

  return (
    <div ref={panelsRef}>
      {Children.map(children, (child) => {
        if (!isValidElement<TabbedViewPanelProps>(child) || mode !== 'self') {
          return child;
        }

        return cloneElement(child, {
          children: (
            <ScrollablePage
              onRefresh={child.props.onRefresh}
              onLoadMore={child.props.onLoadMore}
              hasMore={child.props.hasMore}
              isRefreshing={child.props.isRefreshing}
              isLoadingMore={child.props.isLoadingMore}
            >
              {child.props.children}
            </ScrollablePage>
          ),
        });
      })}
    </div>
  );
}
