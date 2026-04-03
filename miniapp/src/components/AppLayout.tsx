import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';
import { useOutletStore } from '@/store/useOutletStore';

const AppLayout = () => {
  const { selectedOutlet } = useOutletStore();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div
        className="absolute inset-x-4 flex items-center z-10"
        style={{ top: 'var(--zalo-chrome-top)' }}
      >
        {selectedOutlet && (
          <button
            type="button"
            onClick={() => navigate('/outlets')}
            className="text-sm font-medium text-content dark:text-content-dark hover:text-primary truncate max-w-[50%]"
          >
            {selectedOutlet.name}
          </button>
        )}
      </div>
      <div
        className="page-content"
        style={{
          paddingBottom:
            'calc(var(--bottom-nav-height, 3.5rem) + var(--zaui-safe-area-inset-bottom, 0px))',
        }}
      >
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
