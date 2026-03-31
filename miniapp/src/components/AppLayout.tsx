import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/shared/BottomNav';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { useOutletStore } from '@/store/useOutletStore';

const AppLayout = () => {
  const { selectedOutlet } = useOutletStore();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div
        className="absolute inset-x-4 flex items-center justify-between z-10"
        style={{ top: 'var(--zalo-chrome-top)' }}
      >
        {selectedOutlet ? (
          <button
            type="button"
            onClick={() => navigate('/outlets')}
            className="text-sm font-medium text-content dark:text-content-dark hover:text-primary truncate max-w-[50%]"
          >
            {selectedOutlet.name}
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1 ml-auto">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
      <div className="page-content pt-safe">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
