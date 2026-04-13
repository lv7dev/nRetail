import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';

const AppLayout = () => {
  return (
    <div className="app-shell flex h-full flex-col">
      <div
        className="page-content flex min-h-0 flex-1 flex-col"
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
