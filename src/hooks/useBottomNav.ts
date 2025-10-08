import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BottomNavItem {
  slug: string;
  name: string;
  icon: string;
  color?: string;
  target: 'atlas' | 'category_dashboard' | 'planets';
}

export function useBottomNav() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bottom-nav", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("user_bottom_nav", {
        p_user_id: user!.id,
      });

      if (error) throw error;
      return Array.isArray(data) ? (data as unknown as BottomNavItem[]) : [];
    },
  });
}
