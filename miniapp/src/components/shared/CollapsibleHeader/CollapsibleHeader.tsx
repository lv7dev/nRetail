import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

interface CollapsibleCardProps {
  collapsed?: boolean;
}

export interface CollapsibleHeaderProps {
  topBar?: ReactNode;
  children?: ReactNode;
  card?: ReactElement<CollapsibleCardProps>;
  scrollContainerRef?: React.MutableRefObject<HTMLElement | null>;
  collapsed?: boolean;
}

export function CollapsibleHeader({
  topBar,
  children,
  card,
  scrollContainerRef,
  collapsed: controlledCollapsed,
}: CollapsibleHeaderProps) {
  const topZoneRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    const topZone = topZoneRef.current;

    if (!topZone || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateHeight = () => {
      setStickyTop(topZone.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(topZone);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (controlledCollapsed !== undefined) {
      return;
    }

    if (!card || !sentinelRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCollapsed(!entry.isIntersecting);
      },
      { root: scrollContainerRef?.current ?? null, threshold: 0 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [card, controlledCollapsed, scrollContainerRef]);

  const resolvedCollapsed = controlledCollapsed ?? collapsed;

  const renderedCard =
    card && isValidElement(card) ? cloneElement(card, { collapsed: resolvedCollapsed }) : null;

  return (
    <div className="bg-primary">
      <div ref={topZoneRef} style={{ paddingTop: 'var(--zalo-chrome-top)' }}>
        {topBar}
        {children}
      </div>

      {renderedCard && (
        <div
          data-testid="collapsible-header-card-shell"
          className={resolvedCollapsed ? 'sticky z-20 px-4 pb-2' : 'px-4 pb-4'}
          style={resolvedCollapsed ? { top: `${stickyTop}px` } : undefined}
        >
          <div className="transition-all duration-200">{renderedCard}</div>
          <div ref={sentinelRef} className="h-px" data-testid="collapsible-header-sentinel" />
        </div>
      )}
    </div>
  );
}
