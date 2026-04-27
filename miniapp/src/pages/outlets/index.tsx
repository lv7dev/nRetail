import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CollapsibleHeader, TabbedView } from '@/components/shared';
import { AppHeader, Button, SearchInput } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { OutletTabKey } from '@/types/outlet';
import { OutletItem } from './OutletItem';
import waveHeader from '@/static/wave-header.svg';

export default function OutletListPage() {
  const { t } = useTranslation(['outlets', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = !!location.state?.canGoBack;
  const { setSelectedOutlet } = useOutletStore();
  const { clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OutletTabKey>('connected');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);
  const hasAutoForwardedRef = useRef(false);
  const {
    connectedQuery,
    notConnectedQuery,
    connectedOutlets,
    notConnectedOutlets,
    hasSearch,
    handleMembershipAction,
  } = useOutlets({ activeTab, searchTerm: debouncedSearchTerm });

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
            <OutletItem
              outlet={outlet}
              connected={false}
              onConnect={() => handleMembershipAction(outlet.id, 'confirm')}
              onReject={() => handleMembershipAction(outlet.id, 'reject')}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TabbedView
        tabs={[
          { key: 'connected', label: t('outlets.connectedTab') },
          { key: 'not-connected', label: t('outlets.notConnectedTab') },
        ]}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as OutletTabKey)}
      >
        <CollapsibleHeader
          topBar={
            <AppHeader
              title={t('outlets.selectOutlet')}
              onBack={canGoBack ? () => navigate(-1) : undefined}
            />
          }
          decoration={
            <img
              src={waveHeader}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-bottom"
            />
          }
        >
          <div className="px-4 py-5">
            <TabbedView.TabBar variant="on-primary" />
          </div>
        </CollapsibleHeader>

        <div className="flex min-h-0 flex-1 flex-col bg-background pt-4 dark:bg-background-dark">
          <div className="px-4">
            <SearchInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder={t('outlets.searchPlaceholder')}
              aria-label={t('outlets.searchPlaceholder')}
              className="bg-white"
            />
          </div>

          <TabbedView.Panels mode="self">
            <TabbedView.Panel
              tabKey="connected"
              onLoadMore={
                connectedQuery.hasNextPage
                  ? () => {
                      connectedQuery.fetchNextPage();
                    }
                  : undefined
              }
              hasMore={!!connectedQuery.hasNextPage}
              onRefresh={async () => {
                await connectedQuery.refetch();
              }}
              isRefreshing={connectedQuery.isFetching && !connectedQuery.isFetchingNextPage}
              isLoadingMore={connectedQuery.isFetchingNextPage}
            >
              {renderConnectedPanel()}
            </TabbedView.Panel>

            <TabbedView.Panel
              tabKey="not-connected"
              onLoadMore={
                notConnectedQuery.hasNextPage
                  ? () => {
                      notConnectedQuery.fetchNextPage();
                    }
                  : undefined
              }
              hasMore={!!notConnectedQuery.hasNextPage}
              onRefresh={async () => {
                await notConnectedQuery.refetch();
              }}
              isRefreshing={notConnectedQuery.isFetching && !notConnectedQuery.isFetchingNextPage}
              isLoadingMore={notConnectedQuery.isFetchingNextPage}
            >
              {renderNotConnectedPanel()}
            </TabbedView.Panel>
          </TabbedView.Panels>
        </div>
      </TabbedView>
    </div>
  );
}
