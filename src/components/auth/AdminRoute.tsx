import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkRoles = async (userId: string) => {
      try {
        // Attempt to bootstrap an admin if none exists yet
        await supabase.rpc('bootstrap_admin_if_empty');
      } catch {}
      try {
        const { data, error } = (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (error) throw error;
        const roles: Array<{ role: string }> = data ?? [];
        const has = roles.some((r) => r.role === "admin" || r.role === "superadmin");
        setAllowed(has);
      } catch {
        setAllowed(false);
      } finally {
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
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
