import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NavItem {
  slot: number;
  item_type: 'fixed' | 'category';
  label: string;
  slug: string;
  icon: string;
}

export function useBottomNav() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bottom-nav', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Use RPC call with type assertion since it's not in generated types yet
      const { data, error } = await supabase.rpc('user_bottom_nav' as any, {
        u: user.id
      });
      
      if (error) throw error;
      
      return data as NavItem[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}