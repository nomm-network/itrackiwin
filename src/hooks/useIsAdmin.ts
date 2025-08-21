import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecurityMonitoring } from "./useSecurityMonitoring";

export function useIsAdmin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { logSecurityEvent } = useSecurityMonitoring();

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
      
      // Use the secure admin check with rate limiting
      (async () => {
        try {
          const { data: adminResult, error } = await (supabase as any)
            .rpc("is_admin_with_rate_limit", { _user_id: session.user.id });
          
          if (error) {
            console.error('Admin check failed:', error);
            
            // Log security event
            logSecurityEvent({
              action_type: 'admin_check_failed',
              details: { 
                error: error.message,
                user_id: session.user.id,
                timestamp: Date.now()
              }
            });
            
            if (active) setIsAdmin(false);
          } else {
            if (active) setIsAdmin(adminResult === true);
            
            // Log successful admin access
            if (adminResult === true) {
              logSecurityEvent({
                action_type: 'admin_access_granted',
                details: { 
                  user_id: session.user.id,
                  timestamp: Date.now()
                }
              });
            }
          }
        } catch (error) {
          console.error('Unexpected error during admin check:', error);
          
          logSecurityEvent({
            action_type: 'admin_check_error',
            details: { 
              error: String(error),
              user_id: session.user.id,
              timestamp: Date.now()
            }
          });
          
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
        const { data: adminResult, error } = await (supabase as any)
          .rpc("is_admin_with_rate_limit", { _user_id: session.user.id });
        
        if (error) {
          console.error('Initial admin check failed:', error);
          if (active) setIsAdmin(false);
        } else {
          if (active) setIsAdmin(adminResult === true);
        }
      } catch (error) {
        console.error('Unexpected error during initial admin check:', error);
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [logSecurityEvent]);

  return { isAdmin, loading } as const;
}
