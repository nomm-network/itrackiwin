import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Paths } from '../paths';
import { useOnboarding } from '@/hooks/useOnboarding';

export const AuthGuard = () => {
  const location = useLocation();
  const { needsOnboarding, isComplete } = useOnboarding();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to={Paths.auth} state={{ from: location }} replace />;
  }

  // Onboarding check removed - allow access to templates without fitness setup

  // If user completed onboarding but still on onboarding routes, redirect to dashboard
  if (isComplete && (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/fitness/onboarding'))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};