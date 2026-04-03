import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';

const AppLayout = () => {
  return (
    <div className="app-shell">
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
