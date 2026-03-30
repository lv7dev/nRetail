import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';

export default function ProfilePage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { t } = useTranslation('common');

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Profile</h1>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-content">{t('theme')}</span>
        <ThemeSwitcher />
      </div>
      <button data-testid="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
