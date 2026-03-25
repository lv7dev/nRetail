import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';

const AppLayout = () => {
  return (
    <div className="app-shell">
      <div className="page-content pt-safe">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
