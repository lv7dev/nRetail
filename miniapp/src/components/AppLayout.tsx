import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';

const AppLayout = () => {
  return (
    <div className="app-shell">
      <div
        className="absolute right-4 flex items-center gap-1 z-10"
        style={{ top: 'var(--zalo-chrome-top)' }}
      >
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="page-content pt-safe">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
