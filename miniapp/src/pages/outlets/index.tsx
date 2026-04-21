import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TabbedView } from '@/components/shared';
import { Button, Icon, Input } from '@/components/ui';
import { outletService } from '@/services/outletService';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Outlet } from '@/types/outlet';
import { OutletItem } from './OutletItem';

type OutletTabKey = 'connected' | 'not-connected';

function flattenPages(pages: { data: Outlet[] }[] | undefined) {
  return pages?.flatMap((page) => page.data) ?? [];
}

export default function OutletListPage() {
  const { t } = useTranslation(['outlets', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  const { setSelectedOutlet } = useOutletStore();
  const { clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OutletTabKey>('connected');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const hasAutoForwardedRef = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const connectedQuery = useInfiniteQuery({
    queryKey: ['outlets', { connected: true, q: debouncedSearchTerm }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      outletService.getOutlets({
        connected: true,
        q: debouncedSearchTerm || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: activeTab === 'connected',
    retry: false,
  });

  const notConnectedQuery = useInfiniteQuery({
    queryKey: ['outlets', { connected: false, q: debouncedSearchTerm }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      outletService.getOutlets({
        connected: false,
        q: debouncedSearchTerm || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: activeTab === 'not-connected',
    retry: false,
  });

  const connectedOutlets = flattenPages(connectedQuery.data?.pages);
  const notConnectedOutlets = flattenPages(notConnectedQuery.data?.pages);
  const hasSearch = debouncedSearchTerm.length > 0;

  useEffect(() => {
    if (!connectedQuery.isPending && !hasSearch && connectedOutlets.length === 1) {
      if (hasAutoForwardedRef.current) {
        return;
      }

      hasAutoForwardedRef.current = true;
      setSelectedOutlet(connectedOutlets[0]);
      navigate('/', { replace: true });
      return;
    }

    hasAutoForwardedRef.current = false;
  }, [connectedOutlets, connectedQuery.isPending, hasSearch, setSelectedOutlet, navigate]);

  if (!hasSearch && !connectedQuery.isPending && connectedOutlets.length === 1) {
    return null;
  }

  const renderLoadingState = () => {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-content-muted dark:text-content-dark-muted">{t('loading')}</p>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-content dark:text-content-dark">
            {t('outlets.emptyStateTitle')}
          </p>
          <p className="text-sm text-content-muted dark:text-content-dark-muted">
            {t('outlets.emptyStateDescription')}
          </p>
        </div>
        <Button
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
          variant="destructive"
        >
          {t('outlets.logout')}
        </Button>
      </div>
    );
  };

  const renderNoResults = () => (
    <div className="flex flex-1 items-center justify-center p-6 text-center">
      <p className="text-sm text-content-muted dark:text-content-dark-muted">
        {t('outlets.noResults')}
      </p>
    </div>
  );

  const renderConnectedPanel = () => {
    if (connectedQuery.isPending) {
      return renderLoadingState();
    }

    if (!hasSearch && connectedOutlets.length === 0) {
      return renderEmptyState();
    }

    if (connectedOutlets.length === 0) {
      return renderNoResults();
    }

    return (
      <ul className="space-y-3 p-4">
        {connectedOutlets.map((outlet) => (
          <li key={outlet.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedOutlet(outlet);
                navigate('/', { replace: true });
              }}
              className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <OutletItem outlet={outlet} connected />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderNotConnectedPanel = () => {
    if (notConnectedQuery.isPending) {
      return renderLoadingState();
    }

    if (notConnectedOutlets.length === 0) {
      return renderNoResults();
    }

    return (
      <ul className="space-y-3 p-4">
        {notConnectedOutlets.map((outlet) => (
          <li key={outlet.id}>
            <OutletItem outlet={outlet} connected={false} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-primary/10">
      <div className="bg-primary px-4 pb-5 pt-safe">
        <div className="relative pt-4">
          {canGoBack && (
            <button
              type="button"
              aria-label={t('common:button.back')}
              onClick={() => navigate(-1)}
              className="absolute left-0 top-4 text-primary-fg"
            >
              <Icon name="chevron-left" size={24} />
            </button>
          )}
          <h1 className="text-center text-xl font-bold text-primary-fg">
            {t('outlets.selectOutlet')}
          </h1>
        </div>
        <div className="mt-4">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('outlets.searchPlaceholder')}
            aria-label={t('outlets.searchPlaceholder')}
            className="border-0 bg-white"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-t-3xl bg-background pt-4 dark:bg-background-dark">
        <TabbedView
          tabs={[
            { key: 'connected', label: t('outlets.connectedTab') },
            { key: 'not-connected', label: t('outlets.notConnectedTab') },
          ]}
          activeTab={activeTab}
          onTabChange={(tabKey) => setActiveTab(tabKey as OutletTabKey)}
        >
          <div className="px-4">
            <TabbedView.TabBar className="rounded-2xl bg-surface-muted p-1 dark:bg-surface-dark-muted" />
          </div>

          <TabbedView.Panels mode="self">
            <TabbedView.Panel
              tabKey="connected"
              onLoadMore={
                connectedQuery.hasNextPage ? () => connectedQuery.fetchNextPage() : undefined
              }
              hasMore={!!connectedQuery.hasNextPage}
              isLoadingMore={connectedQuery.isFetchingNextPage}
            >
              {renderConnectedPanel()}
            </TabbedView.Panel>

            <TabbedView.Panel
              tabKey="not-connected"
              onLoadMore={
                notConnectedQuery.hasNextPage ? () => notConnectedQuery.fetchNextPage() : undefined
              }
              hasMore={!!notConnectedQuery.hasNextPage}
              isLoadingMore={notConnectedQuery.isFetchingNextPage}
            >
              {renderNotConnectedPanel()}
            </TabbedView.Panel>
          </TabbedView.Panels>
        </TabbedView>
      </div>
    </div>
  );
}
