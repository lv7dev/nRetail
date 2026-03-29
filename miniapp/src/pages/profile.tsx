import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Profile</h1>
      <button data-testid="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
