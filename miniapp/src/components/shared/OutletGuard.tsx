import { Navigate, Outlet } from 'react-router-dom';
import { useOutletStore } from '@/store/useOutletStore';

const OutletGuard = () => {
  const { selectedOutlet } = useOutletStore();
  if (selectedOutlet === null) {
    return <Navigate to="/outlets" replace />;
  }
  return <Outlet />;
};

export default OutletGuard;
