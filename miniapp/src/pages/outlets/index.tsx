import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { outletService } from '@/services/outletService';
import { useOutletStore } from '@/store/useOutletStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Outlet } from '@/types/outlet';

export default function OutletListPage() {
  const { t } = useTranslation('outlets');
  const navigate = useNavigate();
  const { setSelectedOutlet } = useOutletStore();
  const { clearAuth } = useAuthStore();

  const { data: outlets = [], isLoading } = useQuery({
    queryKey: ['outlets', 'mine'],
    queryFn: () => outletService.getMyOutlets(),
  });

  useEffect(() => {
    if (!isLoading && outlets.length === 1) {
      setSelectedOutlet(outlets[0]);
      navigate('/', { replace: true });
    }
  }, [outlets, isLoading, setSelectedOutlet, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-content-muted dark:text-content-dark-muted">{t('loading')}</p>
      </div>
    );
  }

  if (outlets.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-content dark:text-content-dark">
            {t('outlets.noOutlets')}
          </p>
          <p className="text-sm text-content-muted dark:text-content-dark-muted">
            {t('outlets.contactAdmin')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
          className="px-6 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-sm font-medium"
        >
          {t('outlets.logout')}
        </button>
      </div>
    );
  }

  if (outlets.length === 1) {
    // auto-navigating via useEffect
    return null;
  }

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      <div className="pt-safe">
        <h1 className="text-xl font-bold text-content dark:text-content-dark text-center mb-6">
          {t('outlets.selectOutlet')}
        </h1>
        <ul className="space-y-3">
          {outlets.map((outlet: Outlet) => (
            <li key={outlet.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedOutlet(outlet);
                  navigate('/', { replace: true });
                }}
                className="w-full text-left bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all group"
              >
                <p className="font-semibold text-content dark:text-content-dark group-hover:text-primary">
                  {outlet.name}
                </p>
                {outlet.address && (
                  <p className="text-sm text-content-muted dark:text-content-dark-muted mt-1">
                    {outlet.address}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {outlet.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
