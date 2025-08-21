import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecurityMonitoring } from "./useSecurityMonitoring";

export function useIsSuperAdmin() {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { logSecurityEvent } = useSecurityMonitoring();

  useEffect(() => {
    let active = true;
    
    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session?.user) {
        if (active) {
          setIsSuperAdmin(false);
          setLoading(false);
        }
        return;
      }
      
      // Use the secure superadmin check with rate limiting
      (async () => {
        try {
          const { data: superAdminResult, error } = await (supabase as any)
            .rpc("is_superadmin_with_rate_limit", { _user_id: session.user.id });
          
          if (error) {
            console.error('Superadmin check failed:', error);
            
            // Log security event
            logSecurityEvent({
              action_type: 'superadmin_check_failed',
              details: { 
                error: error.message,
                user_id: session.user.id,
                timestamp: Date.now()
              }
            });
            
            if (active) setIsSuperAdmin(false);
          } else {
            if (active) setIsSuperAdmin(superAdminResult === true);
            
            // Log successful superadmin access
            if (superAdminResult === true) {
              logSecurityEvent({
                action_type: 'superadmin_access_granted',
                details: { 
                  user_id: session.user.id,
                  timestamp: Date.now()
                }
              });
            }
          }
        } catch (error) {
          console.error('Unexpected error during superadmin check:', error);
          
          logSecurityEvent({
            action_type: 'superadmin_check_error',
            details: { 
              error: String(error),
              user_id: session.user.id,
              timestamp: Date.now()
            }
          });
          
          if (active) setIsSuperAdmin(false);
        } finally {
          if (active) setLoading(false);
        }
      })();
    }).data.subscription;

    // Initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        if (active) {
          setIsSuperAdmin(false);
          setLoading(false);
        }
        return;
      }
      
      try {
        const { data: superAdminResult, error } = await (supabase as any)
          .rpc("is_superadmin_with_rate_limit", { _user_id: session.user.id });
        
        if (error) {
          console.error('Initial superadmin check failed:', error);
          if (active) setIsSuperAdmin(false);
        } else {
          if (active) setIsSuperAdmin(superAdminResult === true);
        }
      } catch (error) {
        console.error('Unexpected error during initial superadmin check:', error);
        if (active) setIsSuperAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [logSecurityEvent]);

  return { isSuperAdmin, loading } as const;
}