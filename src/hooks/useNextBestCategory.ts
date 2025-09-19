import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NextBestCategory {
  slug: string;
  name: string;
}

export function useNextBestCategory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['next-best-category', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
        .select(`
          life_categories!inner(
            slug,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('is_enabled', true)
        .order('display_order')
        .limit(1);

      if (error) throw error;
      
      return data?.[0] ? {
        slug: data[0].life_categories.slug,
        name: data[0].life_categories.name
      } : null as NextBestCategory | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}