import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { Paths } from '../paths';

export const AdminGuard = () => {
  const admin = useIsSuperAdmin();
  const location = useLocation();

  if (admin.status === "loading") {
    return (
      <main className="container py-12">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return admin.status === "authorized" ? <Outlet /> : <Navigate to={Paths.root} state={{ from: location }} replace />;
};