import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsGymAdmin(gymId?: string) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!gymId) {
        setIsAdmin(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_gym_admin", { 
          gym_uuid: gymId 
        });
        
        if (error) {
          console.error('Error checking gym admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(Boolean(data));
        }
      } catch (error) {
        console.error('Error checking gym admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [gymId]);

  return { isAdmin, isLoading };
}