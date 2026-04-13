import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/utils/cn';

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
  cardOverlap?: number;
  cardRadius?: string;
  className?: string;
}

export function CollapsibleHeader({
  topBar,
  children,
  card,
  decoration,
  scrollContainerRef,
  collapsed: controlledCollapsed,
  cardOverlap = 32,
  cardRadius = 'rounded-b-3xl',
  className,
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

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn('relative overflow-hidden bg-primary', renderedCard && cardRadius)}
        style={{
          paddingTop: 'var(--zalo-chrome-top)',
          ...(renderedCard ? { paddingBottom: `${cardOverlap}px` } : {}),
        }}
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
        <div
          data-testid="collapsible-header-card-shell"
          className={cn('relative px-4')}
          style={{ marginTop: `-${cardOverlap}px` }}
        >
          <div className="transition-all duration-200">{renderedCard}</div>
          <div ref={sentinelRef} className="h-px" data-testid="collapsible-header-sentinel" />
        </div>
      )}
    </div>
  );
}
