import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui';

const WHEEL_SETTLE_MS = 400;
const COLLAPSE_THRESHOLD_PX = 20;

export interface ScrollablePageProps {
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function Spinner({ label }: { label: string }) {
  return (
    <div aria-label={label} className="flex items-center justify-center py-3">
      <svg
        className="h-4 w-4 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}

function PullIndicator({
  pullDistance,
  isRefreshing,
}: {
  pullDistance: number;
  isRefreshing: boolean;
}) {
  const { t } = useTranslation('common');

  if (isRefreshing && pullDistance === 0) {
    return <Spinner label="Refreshing content" />;
  }

  if (pullDistance <= 0) {
    return null;
  }

  const isReadyToRefresh = pullDistance >= 60;

  return (
    <div style={{ height: `${Math.min(pullDistance, 48)}px` }} className="overflow-hidden">
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-content-muted">
        <div
          className={`transition-transform duration-200 ${isReadyToRefresh ? 'rotate-180' : ''}`}
        >
          <Icon name="chevron-down" />
        </div>
        <span>
          {isReadyToRefresh
            ? t('scrollablePage.releaseToRefresh')
            : t('scrollablePage.pullToRefresh')}
        </span>
      </div>
    </div>
  );
}

export function ScrollablePage({
  children,
  onRefresh,
  onLoadMore,
  hasMore = false,
  isRefreshing = false,
  isLoadingMore = false,
  scrollContainerRef,
  onCollapsedChange,
}: ScrollablePageProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pullingRef = useRef(false);
  const arrivedAtTopRef = useRef<number | null>(null);
  const lastCollapsedRef = useRef(false);
  const loadMoreLockRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshPending, setIsRefreshPending] = useState(false);

  useLayoutEffect(() => {
    if (scrollContainerRef) {
      scrollContainerRef.current = internalRef.current;
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    if (!isLoadingMore) {
      loadMoreLockRef.current = false;
    }
  }, [isLoadingMore]);

  useEffect(() => {
    const element = internalRef.current;
    if (!element || !onRefresh) {
      return;
    }

    const preventTouchScroll = (event: TouchEvent) => {
      if (pullingRef.current) {
        event.preventDefault();
      }
    };

    element.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      element.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [onRefresh]);

  useEffect(() => {
    if (!onLoadMore || !sentinelRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !hasMore || isLoadingMore || loadMoreLockRef.current) {
          return;
        }

        loadMoreLockRef.current = true;
        void onLoadMore();
      },
      { root: internalRef.current, threshold: 0 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Touch pull-to-refresh
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!onRefresh) return;
    const touch = event.touches[0]!;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    pullingRef.current = false;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!onRefresh || !touchStartRef.current || isRefreshing) return;

    const touch = event.touches[0]!;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (internalRef.current!.scrollTop > 0 || deltaY <= 0 || deltaY <= Math.abs(deltaX) * 2) {
      return;
    }

    pullingRef.current = true;
    setPullDistance(Math.min(deltaY, 120));
  };

  const handleTouchEnd = async () => {
    if (!onRefresh) return;

    const shouldRefresh = pullingRef.current && pullDistance >= 60;
    pullingRef.current = false;
    touchStartRef.current = null;

    if (shouldRefresh) {
      setPullDistance(0);
      setIsRefreshPending(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshPending(false);
      }
      return;
    }

    setPullDistance(0);
  };

  // Mouse wheel overscroll-to-refresh: spin up at scrollTop=0
  const handleWheel = async (event: React.WheelEvent<HTMLDivElement>) => {
    if (!onRefresh || isRefreshing || isRefreshPending) return;
    if (internalRef.current!.scrollTop !== 0 || event.deltaY >= 0) return;
    const elapsed = performance.now() - (arrivedAtTopRef.current ?? -Infinity);
    if (elapsed < WHEEL_SETTLE_MS) return;
    setPullDistance(0);
    setIsRefreshPending(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshPending(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;

    if (scrollTop === 0) {
      arrivedAtTopRef.current = performance.now();
    }
    if (pullingRef.current) {
      return;
    }

    if (scrollTop === 0) {
      lastCollapsedRef.current = false;
      onCollapsedChange?.(false);
      return;
    }

    if (scrollTop < COLLAPSE_THRESHOLD_PX || lastCollapsedRef.current) {
      return;
    }

    lastCollapsedRef.current = true;
    onCollapsedChange?.(true);
  };

  return (
    <div
      ref={internalRef}
      data-testid="scrollable-page"
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onScroll={handleScroll}
    >
      <PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing || isRefreshPending} />
      <div>{children}</div>
      {onLoadMore && (
        <div ref={sentinelRef} data-testid="scrollable-page-sentinel" className="h-px" />
      )}
      {isLoadingMore && <Spinner label="Loading more" />}
    </div>
  );
}
