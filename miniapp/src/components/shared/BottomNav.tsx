import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, cartItemCount } from '@/store/useCartStore';

const tabs = [
  { label: 'Home', icon: '🏠', path: '/' },
  { label: 'Products', icon: '📦', path: '/products' },
  { label: 'Cart', icon: '🛒', path: '/cart' },
  { label: 'Orders', icon: '📋', path: '/orders' },
  { label: 'Profile', icon: '👤', path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore(cartItemCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white border-t border-gray-200 z-50">
      {tabs.map((tab) => {
        const isActive = tab.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-1 flex-col items-center justify-center py-2 gap-0.5 relative"
            style={{ color: isActive ? '#1a73e8' : '#6b7280', fontWeight: isActive ? 700 : 400 }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
            {tab.path === '/cart' && cartCount > 0 && (
              <span
                className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
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
