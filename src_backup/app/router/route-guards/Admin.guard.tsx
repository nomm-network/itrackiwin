import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsSuperAdmin } from '@/shared/hooks/useIsSuperAdmin';
import { Paths } from '../paths';

export const AdminGuard = () => {
  const { isSuperAdmin, loading } = useIsSuperAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <main className="container py-12">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return isSuperAdmin ? <Outlet /> : <Navigate to={Paths.root} state={{ from: location }} replace />;
};