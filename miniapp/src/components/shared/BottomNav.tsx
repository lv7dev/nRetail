import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, cartItemCount } from '@/store/useCartStore';
import { Icon, IconVariant } from '@/components/ui';

const tabs: { label: string; icon: string; variant?: IconVariant; path: string }[] = [
  { label: 'Home', icon: 'house', variant: 'solid', path: '/' },
  { label: 'Products', icon: 'box', variant: 'solid', path: '/products' },
  { label: 'Cart', icon: 'cart-shopping', variant: 'solid', path: '/cart' },
  { label: 'Orders', icon: 'clipboard-list', variant: 'solid', path: '/orders' },
  { label: 'Profile', icon: 'user', variant: 'solid', path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore(cartItemCount);

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
            className="flex flex-1 flex-col items-center justify-center py-2 gap-0.5 relative"
            style={{ color: isActive ? '#4f46e5' : '#71717a', fontWeight: isActive ? 700 : 400 }}
          >
            <Icon name={tab.icon} variant={tab.variant} size={20} />
            <span className="text-xs">{tab.label}</span>
            {tab.path === '/cart' && cartCount > 0 && (
              <span
                className="absolute top-1 right-1/4 bg-destructive text-destructive-fg text-xs rounded-full w-4 h-4 flex items-center justify-center"
                style={{ fontSize: '10px' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
