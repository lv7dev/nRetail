import { type ReactNode, useEffect, useRef, useState } from 'react';

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
  const loadMoreLockRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
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
      await onRefresh();
    }

    setPullDistance(0);
  };

  // Mouse wheel overscroll-to-refresh: spin up at scrollTop=0
  const handleWheel = async (event: React.WheelEvent<HTMLDivElement>) => {
    if (!onRefresh || isRefreshing) return;
    if (internalRef.current!.scrollTop !== 0 || event.deltaY >= 0) return;
    setPullDistance(60);
    await onRefresh();
    setPullDistance(0);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onCollapsedChange?.(event.currentTarget.scrollTop > 0);
  };

  return (
    <div
      ref={internalRef}
      data-testid="scrollable-page"
      className="min-h-0 flex-1 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onScroll={handleScroll}
    >
      {(pullDistance > 0 || isRefreshing) && <Spinner label="Refreshing content" />}
      <div>{children}</div>
      {onLoadMore && (
        <div ref={sentinelRef} data-testid="scrollable-page-sentinel" className="h-px" />
      )}
      {isLoadingMore && <Spinner label="Loading more" />}
    </div>
  );
}
