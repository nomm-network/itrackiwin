import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPriority {
  category_id: string;
  slug: string;
  name: string;
  icon: string;
  priority_rank: number;
}

export function useUserPriorities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-priorities', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
        .select(`
          category_id,
          display_order,
          life_categories!inner(
            slug,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('is_enabled', true)
        .order('display_order');

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        category_id: item.category_id,
        slug: item.life_categories.slug,
        name: item.life_categories.name,
        icon: item.life_categories.icon,
        priority_rank: item.display_order,
      })) as UserPriority[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}