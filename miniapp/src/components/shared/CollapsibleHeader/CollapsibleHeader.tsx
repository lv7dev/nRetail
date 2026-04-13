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
  decoration?: ReactNode;
  scrollContainerRef?: React.MutableRefObject<HTMLElement | null>;
  collapsed?: boolean;
}

export function CollapsibleHeader({
  topBar,
  children,
  card,
  decoration,
  scrollContainerRef,
  collapsed: controlledCollapsed,
}: CollapsibleHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

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
  const topZoneCardClasses = renderedCard !== null ? ' pb-8 rounded-b-3xl' : '';

  return (
    <div>
      <div
        className={`relative overflow-hidden bg-primary${topZoneCardClasses}`}
        style={{ paddingTop: 'var(--zalo-chrome-top)' }}
      >
        {decoration && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            {decoration}
          </div>
        )}
        <div className="relative z-10">
          {topBar}
          {children}
        </div>
      </div>

      {renderedCard && (
        <div data-testid="collapsible-header-card-shell" className="relative px-4 z-20 mt-[-32px]">
          <div className="transition-all duration-200">{renderedCard}</div>
          <div ref={sentinelRef} className="h-px" data-testid="collapsible-header-sentinel" />
        </div>
      )}
    </div>
  );
}
