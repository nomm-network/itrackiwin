import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const AdminRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const checkRoles = async (userId: string) => {
      try {
        // Use the secure admin check with rate limiting
        const { data: isAdm, error: rpcErr } = await (supabase as any).rpc('is_superadmin_with_rate_limit');
        
        if (rpcErr) {
          // Log the error for security monitoring
          console.error('Admin check failed:', rpcErr);
          
          // If rate limit exceeded, show appropriate message
          if (rpcErr.message?.includes('Rate limit exceeded')) {
            setAllowed(false);
            setLoading(false);
            return;
          }
          
          // For other errors, deny access (no fallback)
          setAllowed(false);
          setLoading(false);
          return;
        }
        
        setAllowed(isAdm === true);
        setLoading(false);
      } catch (error) {
        // Log security event
        console.error('Unexpected error during admin check:', error);
        
        // Always deny access on any error - no fallback mechanism
        setAllowed(false);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      checkRoles(session.user.id);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      checkRoles(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="container py-12">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </main>
    );
  }

  if (!allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
