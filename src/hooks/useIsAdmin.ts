import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session?.user) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      // fetch roles for current user
      (async () => {
        try {
          const { data, error } = (supabase as any)
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          if (error) throw error;
          const roles: Array<{ role: string }> = data ?? [];
          const has = roles.some((r) => r.role === "admin" || r.role === "superadmin");
          if (active) setIsAdmin(has);
        } catch (_e) {
          if (active) setIsAdmin(false);
        } finally {
          if (active) setLoading(false);
        }
      })();
    }).data.subscription;

    // Initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error } = (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        if (error) throw error;
        const roles: Array<{ role: string }> = data ?? [];
        const has = roles.some((r) => r.role === "admin" || r.role === "superadmin");
        if (active) setIsAdmin(has);
      } catch (_e) {
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, []);

  return { isAdmin, loading } as const;
}
