import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col dark:bg-surface-dark">
      <div
        className="absolute right-4 flex items-center gap-1"
        style={{ top: 'var(--zalo-chrome-top)' }}
      >
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
