import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, IconVariant } from '@/components/ui';

const tabs: { labelKey: string; icon: string; variant?: IconVariant; path: string }[] = [
  { labelKey: 'nav.home', icon: 'house', variant: 'solid', path: '/' },
  { labelKey: 'nav.order', icon: 'clipboard-list', variant: 'solid', path: '/orders' },
  { labelKey: 'nav.outlet', icon: 'store', variant: 'solid', path: '/outlet-detail' },
  { labelKey: 'nav.account', icon: 'user', variant: 'solid', path: '/account' },
];

export default function BottomNav() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed left-0 right-0 flex bg-surface border-t border-border z-50 dark:bg-surface-dark dark:border-border-dark"
      style={{ bottom: 'var(--zaui-safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 relative ${isActive ? 'text-primary font-bold' : 'text-content-muted dark:text-content-dark-muted font-normal'}`}
          >
            <Icon name={tab.icon} variant={tab.variant} size={20} />
            <span className="text-xs">{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
