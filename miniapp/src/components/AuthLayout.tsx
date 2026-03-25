import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
